const MAX_IMAGE_UPLOAD_KB = 1024;
const DEFAULT_COLOURS = ['#fff','#fff','#fff','#fff','#fff'];

const EMBEDDING_URL = "https://7k67tyke1c.execute-api.eu-west-1.amazonaws.com/dev_stage/embedding";
// const EMBEDDING_URL = "http://localhost:8081/v1/embedding";

const ANNOTATE_URL = "https://7k67tyke1c.execute-api.eu-west-1.amazonaws.com/dev_stage/annotate/image";
// const ANNOTATE_URL = "http://localhost:8080/v1/annotate/image";

let renderedProductIds = [];


// TEMPLATES
var HB_TEMPLATE_PRODUCTS = Handlebars.compile(
    `<ul class='products'>
        {{#each products}}
            {{#if ../loadingProducts}}
                {{>dummyProduct}}
            {{else}}
                {{>product loadingPalettes=../loadingPalettes}}
            {{/if}}
        </li>
        {{/each}}
    </ul>
    `
);

var HB_TEMPLATE_COLOURS = Handlebars.compile(
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
        <input id="file" type="file" accept=".jpg,.jpeg,.png" onchange="selectImageFile(this);"/>
        <div class='search-image-frame'>
            <img id="search-image" src='img/image-placeholder.png' class='loading' title='Click to select image'>
            <p id='search-image-help' class='visible'>Click to upload image (max 1024kB).</p>
        </div>
        <div id='search-image-palette' class='palette loading hidden'>
            <div class='colours'>
                {{>colours}}
            </div>
        </div>
    </div>`
)

Handlebars.registerPartial(
    "product", 
    `<li class='product'>
        {{>productImage}}
        {{>palette loadingPalettes=loadingPalettes}}
        {{>productDetails}}
    </li>`
)

Handlebars.registerPartial(
    "dummyProduct", 
    `<li class='product'>
        <div class='image-container'></div>
        {{>dummyPalette}}
        {{>dummyProductDetails}}
    </li>`
)

Handlebars.registerPartial(
    "productDetails", 
    `<div class='product-details'>
        <h4>{{designerName}}</h4>
        <h4>{{name}}</h4>
    </div>`
)

Handlebars.registerPartial(
    "dummyProductDetails", 
    `<div class='product-details'>
        <h4>DESIGNER</h4>
        <h4>Product</h4>
    </div>`
)

Handlebars.registerPartial(
    "palette",
    `<a href='?variantId={{partNumber}}'>
        <div class='palette {{#if loadingPalettes}}loading{{/if}}' id='palette-{{partNumber}}'>
            <div class='colours'>
                {{>colours}}
            </div>
        </div>
    </a>`
)

Handlebars.registerPartial(
    "dummyPalette",
    `<div class='palette loading'>
        <div class='colours'>
            {{>colours}}
        </div>
    </div>`
)

Handlebars.registerPartial(
    "colours",
    `{{#each colours}}
        <div class='colour' style='background-color:{{this}};'></div>
    {{/each}}`
)
// END TEMPLATES


// COMMON FUNCTIONS
function fetchRetry(url, options, retries){
    return fetch(url, options)
        .then(response => {
            if(response.status != 200){
                if(retries > 0){
                    retries = retries - 1;
                    return fetchRetry(url, options, retries);
                }
            }
            return response;
        })
        .catch(error => {
            console.log('Error:', error);
            console.log('Retries:',retries)
            retries = retries - 1;
            return fetchRetry(url, options, retries);
        });
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

function neighbourToColours(neighbour){
    return neighbour.attributes.palette.split('-');
}

function base64ImageSizeKb(base64Image){
    return Math.ceil(3*(base64Image.length/4))/1024;
}

function embeddingGetNeighboursEmbeddings(embeddings){
    let artPaletteEmbedding = embeddings.embeddings.filter(embedding => embedding.id == "art-palette")[0];
    var neighboursEmbeddingUrl = EMBEDDING_URL + "/neighbours?embedding="+artPaletteEmbedding.value.join(',')+"&index="+INDEX_ID;
    embeddingSearchNeighbours(neighboursEmbeddingUrl);
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
        .then(products => renderProducts(products, false, false))
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
        .then(response => {return mergeNeighbourProductData(neighbours,response.products)}) //TODO remove return
        .catch(error => console.log('error', error));
}

function mergeNeighbourProductData(neighbours, products){
    // TODO simplify
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
// END COMMON FUNCTIONS


// PLP PAGE
function initPlpPage(){
    renderPlaceholderProducts();

    var headers = new Headers();
    headers.append(PARAM_NAME_X_IBM_CLIENT_ID, PARAM_VALUE_X_IBM_CLIENT_ID);

    var requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };

    // TODO convert to fetchRetry?
    fetch(PLP_URL, requestOptions)
        .then(response => response.json())
        .then(plpResponseToProducts)
        .then(products => renderProducts(products, false, true))
        .then(plpLoadPalettes)
        .catch(error => console.log('error', error));
    
}

function plpResponseToProducts(plpResponse){
    return plpResponse.products.map(product => {
        return {
            partNumber: product.productColours[0].partNumber,
            designerName: product.designerName,
            name: product.name,
            imageView: product.productColours[0].imageViews[0],
            colours: DEFAULT_COLOURS
        }
    });
}

function plpLoadPalettes(products){
    let variantIds = products.map(product => product.partNumber)

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    var embeddingsUrl = EMBEDDING_URL + "/self?embedding_id="+variantIds.join()+"&index="+INDEX_ID;
    // TODO convert to fetchRetry?
    fetch(embeddingsUrl, requestOptions)
        .then(response => response.json())
        .then(renderPalettes)
        .catch(error => console.log('error', error));
}
// END PLP PAGE


// VARIANT PAGE
function initVariantPage(variantId){
    renderPlaceholderProducts();

    var searchVariantEmbeddingUrl = EMBEDDING_URL + "/self?embedding_id="+variantId+"&index="+INDEX_ID;
    embeddingSearchSelf(searchVariantEmbeddingUrl);

    var neighboursEmbeddingsUrl = EMBEDDING_URL + "/neighbours?embedding_id="+variantId+"&index="+INDEX_ID;
    embeddingSearchNeighbours(neighboursEmbeddingsUrl);
}
// END VARIANT PAGE


// IMAGE PAGE
function initImagePage(){
    let data = {colours:DEFAULT_COLOURS}
    let searchContent = HB_TEMPLATE_SEARCH_IMAGE(data);
    document.getElementById("search").innerHTML = searchContent;
    document.getElementById("search-image").onclick = function(event){
        document.getElementById("file").click();
    }
    document.getElementById("search-image-help").onclick = function(event){
        document.getElementById("file").click();
    }
}

function selectImageFile(element) {
    var file = element.files[0];
    var reader = new FileReader();
    reader.onloadend = searchImage;
    reader.readAsDataURL(file);
}

function searchImage(event){
    let base64Image = event.target.result;

    if(base64ImageSizeKb(base64Image) > MAX_IMAGE_UPLOAD_KB){
        renderImageError({statusText: 'Image is too large, must be less than '+MAX_IMAGE_UPLOAD_KB+'kB.'});
        return;
    }
    
    renderImage(base64Image);
    renderPlaceholderProducts();
    annotateImage(base64Image)
        .then(renderImageEmbedding)
        .then(embeddingGetNeighboursEmbeddings)
        .catch(manageAnnotateImageError);
}

function manageAnnotateImageError(error){
    console.log(error);
    renderImageError(error);
}

function annotateImage(base64Image){
    var requestOptions = {
        method: 'POST',
        redirect: 'follow',
        body: base64Image
    };

    return fetchRetry(ANNOTATE_URL, requestOptions, 2)
        .then(manageResponse)
}
// END IMAGE PAGE


// RENDER FUNCTIONS
function renderPlaceholderProducts(){
    let products = [];
    for(let i=0; i < PRODUCTS_SIZE; i++){
        products.push({colours:DEFAULT_COLOURS});
    }
    return renderProducts(products, true, true)
}

function renderProducts(products, isLoadingProducts, isLoadingPalettes){
    renderedProductIds = products
        .filter(product => product.partNumber)
        .map(product => product.partNumber);

    let productsContent = HB_TEMPLATE_PRODUCTS({products: products, loadingProducts:isLoadingProducts, loadingPalettes: isLoadingPalettes});
    document.getElementById("results").innerHTML = productsContent; 
    return products;
}

function renderPalettes(neighbours){
    neighbours.forEach(neighbour => {
        let resultHtml = HB_TEMPLATE_COLOURS({colours: neighbourToColours(neighbour)});
        document.getElementById("palette-"+neighbour.id).innerHTML = resultHtml;
        document.getElementById("palette-"+neighbour.id).classList.remove('loading');
    });
    return neighbours;
}

function renderSearchPalette(neighbour){
    let searchPalette = HB_TEMPLATE_SEARCH_PALETTE({colours: neighbourToColours(neighbour)});
    document.getElementById("search").innerHTML = searchPalette;
    return neighbour;
}

function renderImage(base64Image){
    document.getElementById("search-image").classList.remove('loading');
    document.getElementById("search-image-help").classList.remove('visible');
    document.getElementById("search-image-palette").classList.remove('hidden');
    document.getElementById("search-image").setAttribute('src',base64Image);
}

function renderImageError(error){
    document.getElementById("search-image").classList.add('loading');
    document.getElementById("search-image-help").classList.add('visible');
    document.getElementById("search-image-help").innerHTML = error.statusText
    document.getElementById("search-image").setAttribute('src','img/image-placeholder.png');
}

function renderImageEmbedding(embedding){
    let hexColours = embedding.palette.colours.map(colour => colour.hex);
    let paletteHtml = HB_TEMPLATE_COLOURS({colours:hexColours})
    document.getElementById("search-image-palette").innerHTML = paletteHtml;
    document.getElementById("search-image-palette").classList.remove('loading');
    return embedding;
}
// END RENDER FUNCTIONS

function copyIdsToClipboard(){
    navigator.clipboard.writeText(renderedProductIds.join(','));
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
    initVariantPage(params.variantId);
}
else if(params.page && params.page == 'image'){
    initImagePage();
}
else{
    initPlpPage();
}
// END PAGE INIT