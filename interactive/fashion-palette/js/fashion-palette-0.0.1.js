const PLP_URL = "https://www.net-a-porter.com/api/nap/search/resources/store/nap_gb/productview/byCategory?attrs=true&category=/clothing&locale=en_US&orderBy=5&pageNumber=1&pageSize=60";
// const PLP_URL = "clothing-plp.json"

const PRODUCT_SUMMARY_URL = "https://ecomm.ynap.biz/api/nap/search/resources/store/nap_gb/productview/summary";

// const EMBEDDING_URL = "https://7k67tyke1c.execute-api.eu-west-1.amazonaws.com/dev_stage/embedding";
const EMBEDDING_URL = "http://localhost:8081/v1/embedding";

const ANNOTATE_URL = "http://localhost:8080/v1/annotate/image";

const PARAM_VALUE_X_IBM_CLIENT_ID = "95f14cbd-793e-46ec-9f76-6fac2fbb6683";
const PARAM_NAME_X_IBM_CLIENT_ID = "x-ibm-client-id";

var HB_TEMPLATE_PRODUCTS = Handlebars.compile(
    `<ul class='products'>
        {{#each products}}
        <li class='product' data-variantid='{{partNumber}}'>
            <a href='https://www.net-a-porter.com/en-gb/shop/product/{{partNumber}}'>
                <img src='http://www.net-a-porter.com/variants/images/{{partNumber}}/{{imageView}}/w300.jpg'/>
            </a>
            {{>palette paletteState='{{../paletteState}}'}}
            {{>productDetails}}
        </li>
        {{/each}}
    </ul>
    `
);

var HB_TEMPLATE_PALETTE = Handlebars.compile(
    `<div class='colours'>
        {{>colours}}
    </div>`
)

var HB_TEMPLATE_SEARCH_PALETTE = Handlebars.compile(
    `<div class='palette loaded'>
        <div class='colours'>
            {{>colours}}
        </div>
    </div>`
)

var HB_TEMPLATE_SEARCH_IMAGE = Handlebars.compile(
    `<div class='search-image'>
        <input id="file" type="file" accept=".jpg,.jpeg,.png" onchange="encodeImageFileAsURL(this);"/>
        <div class='search-image-frame'>
            <img id="search-image" src='img/image-placeholder.png' class='loading' title='Click to select image'>
        </div>
        <div id='search-image-palette' class='palette'></div>
    </div>`
)

Handlebars.registerPartial(
    "productDetails", 
    `<div class='product-details'>
        <h4>{{designerName}}</h4>
        <h4>{{name}}</h4>
    </div>`
)

Handlebars.registerPartial(
    "palette",
    `<a href='?variantId={{partNumber}}'>
        <div class='palette {{paletteState}}' id='palette-{{partNumber}}'>
            <div class='colours'>
                {{>colours}}
            </div>
        </div>
    </a>`
)

Handlebars.registerPartial(
    "colours",
    `{{#each colours}}
        <div class='colour' style='background-color:{{this}};'></div>
    {{/each}}`
)

function fetchRetry(url, options, retries){
    return fetch(url, options)
        .then(response => {
            if(response.status == 504){
                if(retries > 0){
                    retries = retries - 1;
                    return fetchRetry(url, options, retries);
                }
            }
            return response;
        });
}

// PLP FUNCTIONS
function plpLoad(){
    var headers = new Headers();
    headers.append(PARAM_NAME_X_IBM_CLIENT_ID, PARAM_VALUE_X_IBM_CLIENT_ID);

    var requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };

    fetch(PLP_URL, requestOptions)
        .then(response => response.json())
        .then(plpToProducts)
        .then(products => renderProducts(products, "loading"))
        .then(plpLoadPalettes)
        .catch(error => console.log('error', error));
}

function plpToProducts(plpResponse){
    return plpResponse.products.map(product => {
        return {
            partNumber: product.productColours[0].partNumber,
            designerName: product.designerName,
            name: product.name,
            imageView: product.productColours[0].imageViews[0],
            colours: ['#f3f1ec', '#f4f2ec', '#f5f3ed', '#f6f4ed', '#f7f5ee']
        }
    });
}

function plpLoadPalettes(products){
    let variantIds = products.map(product => product.partNumber)

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    var embeddingsUrl = EMBEDDING_URL + "/self?embedding_id="+variantIds.join()+"&index=colour-palette";
    fetch(embeddingsUrl, requestOptions)
        .then(response => response.json())
        .then(renderPalettes)
        .catch(error => console.log('error', error));
}


// EMBEDDING FUNCTIONS
function embeddingGetNeighboursVariant(variantId){
    var searchVariantEmbeddingUrl = EMBEDDING_URL + "/self?embedding_id="+variantId+"&index=colour-palette";
    embeddingSearchSelf(searchVariantEmbeddingUrl);

    var neighboursEmbeddingsUrl = EMBEDDING_URL + "/neighbours?embedding_id="+variantId+"&index=colour-palette";
    embeddingSearchNeighbours(neighboursEmbeddingsUrl);
}

function embeddingGetNeighboursEmbeddings(embeddings){
    let artPaletteEmbedding = embeddings.embeddings.filter(embedding => embedding.id == "art-palette")[0];
    var neighboursEmbeddingUrl = EMBEDDING_URL + "/neighbours?embedding="+artPaletteEmbedding.value.join(',')+"&index=colour-palette";
    embeddingSearchNeighbours(neighboursEmbeddingUrl);
}

function manageResponse(response){
    if(!response.ok){
        let responseError = {
            statusText: response.statusText,
            status: response.status
        };
        throw(responseError);
    }
    return response.json();
}

function embeddingSearchSelf(searchVariantEmbeddingUrl){
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetchRetry(searchVariantEmbeddingUrl, requestOptions, 2)
        .then(manageResponse)
        .then(results => results[0])
        .then(renderSearchPalette)
        .catch(error => console.log('Error in embeddingSearchSelf:', error));
}

function embeddingSearchNeighbours(neighboursUrl){
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetchRetry(neighboursUrl, requestOptions, 2)
        .then(manageResponse)
        .then(addProductData)
        .then(products => renderProducts(products, 'loaded'))
        .catch(error => console.log('Error in embeddingSearchNeighbours:', error));
}

function addProductData(neighbours){
    let variantIds = neighbours.map(neighbour => neighbour.id);
    let requestParams = variantIds.map(variantId => "pn="+variantId).join('&');
    let productsummaryUrl = PRODUCT_SUMMARY_URL + "/byPartNumbers?"+requestParams
    
    var headers = new Headers();
    headers.append(PARAM_NAME_X_IBM_CLIENT_ID, PARAM_VALUE_X_IBM_CLIENT_ID);

    var requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };

    return fetch(productsummaryUrl, requestOptions)
        .then(response => response.json())
        .then(response => {return mergeNeighbourProductData(neighbours,response.products)})
        .catch(error => console.log('error', error));
}

function mergeNeighbourProductData(neighbours, products){
    return neighbours
        .map(neighbour => {
            let productData = products.filter(product => product.partNumber == neighbour.id)[0];
            if(productData){
                productData.imageView = productData.imageViews[0];
            }
            let colourData = {points: neighbour.points, colours: neighbourToColours(neighbour)};
            let mergedData = {}
            Object.assign(mergedData, colourData, productData);
            return mergedData;
        })
        .filter(product => product.imageView);
}

function neighbourToColours(neighbour){
    return neighbour.attributes.palette.split('-');
}


function encodeImageFileAsURL(element) {
    var file = element.files[0];
    var reader = new FileReader();
    reader.onloadend = searchImage;
    reader.readAsDataURL(file);
}

function searchImage(event){
    let base64Image = event.target.result;
    renderImage(base64Image);
    annotateImage(base64Image)
        .then(renderImageEmbedding)
        .then(embeddingGetNeighboursEmbeddings)
}

function annotateImage(base64Image){
    var requestOptions = {
        method: 'POST',
        redirect: 'follow',
        body: base64Image
    };

    return fetchRetry(ANNOTATE_URL, requestOptions, 2)
        .then(manageResponse)
        .catch(error => console.log('error', error));
}


// RENDER FUNCTIONS
function renderImagePage(){
    let searchContent = HB_TEMPLATE_SEARCH_IMAGE();
    document.getElementById("search").innerHTML = searchContent;
    document.getElementById("search-image").onclick = function(event){
        document.getElementById("file").click();
    }
}

function renderImage(base64Image){
    document.getElementById("search-image").classList.remove('loading');
    document.getElementById("search-image").setAttribute('src',base64Image);
}

function renderProducts(products, paletteState){
    let productsContent = HB_TEMPLATE_PRODUCTS({products: products, paletteState: paletteState});
    document.getElementById("results").innerHTML = productsContent; 
    return products;
}

function renderImageEmbedding(embedding){
    let hexColours = embedding.palette.colours.map(colour => colour.hex);
    let paletteHtml = HB_TEMPLATE_PALETTE({colours:hexColours})
    document.getElementById("search-image-palette").innerHTML = paletteHtml;
    return embedding;
}

function renderSearchPalette(neighbour){
    let searchPalette = HB_TEMPLATE_SEARCH_PALETTE({colours: neighbourToColours(neighbour)});
    document.getElementById("search").innerHTML = searchPalette;
    return neighbour;
}

function renderPalettes(neighbours){
    neighbours.forEach(neighbour => {
        let resultHtml = HB_TEMPLATE_PALETTE({colours: neighbourToColours(neighbour)});
        document.getElementById("palette-"+neighbour.id).innerHTML = resultHtml;
        document.getElementById("palette-"+neighbour.id).classList.remove('loading');
    });
    return neighbours;
}


// PAGE INIT
function getParams(location) {
    const searchParams = new URLSearchParams(location.search);
    return {
      variantId: searchParams.get('variantId') || false,
      page: searchParams.get('page') || false
    };
}


const params = getParams(window.location);
if(params.variantId){
    embeddingGetNeighboursVariant(params.variantId);
}
else if(params.page && params.page == 'image'){
    renderImagePage();
}
else{
    plpLoad();
}
