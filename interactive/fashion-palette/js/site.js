const PLP_URL = "https://www.net-a-porter.com/api/nap/search/resources/store/nap_gb/productview/byCategory?attrs=true&category=/clothing&locale=en_US&orderBy=5&pageNumber=1&pageSize=60";
// const PLP_URL = "clothing-plp.json"
const PRODUCT_SUMMARY_URL = "https://ecomm.ynap.biz/api/nap/search/resources/store/nap_gb/productview/summary";
const EMBEDDING_URL = "https://7k67tyke1c.execute-api.eu-west-1.amazonaws.com/dev_stage/embedding";
// const EMBEDDING_BASE_URL = "http://localhost:8080/v1/embedding";

const PARAM_VALUE_X_IBM_CLIENT_ID = "95f14cbd-793e-46ec-9f76-6fac2fbb6683";
const PARAM_NAME_X_IBM_CLIENT_ID = "x-ibm-client-id";

var HB_TEMPLATE_PRODUCTS = Handlebars.compile(
    `<ul class='products'>
        {{#each products}}
        <li class='product' data-variantid='{{partNumber}}'>
            <a href='https://www.net-a-porter.com/en-gb/shop/product/{{partNumber}}'>
                <img src='http://www.net-a-porter.com/variants/images/{{partNumber}}/{{imageView}}/w300.jpg'/>
            </a>
            {{>palette}}
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

var HB_TEMPLATE_SEARCH_VARIANT = Handlebars.compile(
    `<div class='palette'>
        <div class='colours'>
            {{>colours}}
        </div>
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
        <div class='palette' id='palette-{{partNumber}}'>
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


function loadPlp(){
    var headers = new Headers();
    headers.append(PARAM_NAME_X_IBM_CLIENT_ID, PARAM_VALUE_X_IBM_CLIENT_ID);

    var requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };

    fetch(PLP_URL, requestOptions)
        .then(response => response.json())
        .then(mapToProducts)
        .then(renderProducts)
        .then(loadPalettes)
        .catch(error => console.log('error', error));
}

function mapToProducts(plpResponse){
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

function renderProducts(products){
    let productsContent = HB_TEMPLATE_PRODUCTS({products: products});
    document.getElementById("results").innerHTML = productsContent; 
    return products;
}

function loadPalettes(products){
    let variantIds = products
        .map(product => product.partNumber)

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

function renderPalettes(results){
    results.forEach(result => {
        let variantId = result.id;
        let colours = result.attributes.palette.split('-');
        let resultHtml = HB_TEMPLATE_PALETTE({colours: colours});
        document.getElementById("palette-"+variantId).innerHTML = resultHtml;
    });
}

function loadVariant(variantId){
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    var searchVariantEmbeddingUrl = EMBEDDING_URL + "/self?embedding_id="+variantId+"&index=colour-palette";
    fetch(searchVariantEmbeddingUrl, requestOptions)
        .then(response => response.json())
        .then(results => results[0])
        .then(renderSearchVariant)
        .catch(error => console.log('error', error));

    var neighbourVariantsEmbeddingsUrl = EMBEDDING_URL + "/neighbours?embedding_id="+variantId+"&index=colour-palette";
    fetch(neighbourVariantsEmbeddingsUrl, requestOptions)
        .then(response => response.json())
        .then(addProductData)
        .then(renderNeighboursProductData)
        .catch(error => console.log('error', error));
}

function addProductData(neighbours){
    let variantIds = neighbours
        .map(neighbour => {return neighbour.id});

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
            let colourData = {points: neighbour.points, colours: neighbour.attributes.palette.split('-')};
            let mergedData = {}
            Object.assign(mergedData, colourData, productData);
            return mergedData;
        })
        .filter(product => product.imageView);
}

function renderSearchVariant(searchVariantEmbedding){
    let colours = embeddingToColours(searchVariantEmbedding);
    let searchHtml = HB_TEMPLATE_SEARCH_VARIANT({colours: colours});
    document.getElementById("search").innerHTML = searchHtml;
}

function renderNeighboursProductData(neighboursProductData){
    let neighboursHtml = HB_TEMPLATE_PRODUCTS({products:neighboursProductData});
    document.getElementById("results").innerHTML = neighboursHtml; 
    // document.querySelectorAll(".palette").forEach(element => element.addEventListener("click", loadVariant));
}

function embeddingToColours(embedding){
    return embedding.attributes.palette.split('-');
}


function searchVariant(){
    let searchVariant = document.getElementById("search_variant_id").value;
    if(searchVariant){
        window.location = "?variantId="+searchVariant;
    }

}

function getParams(location) {
    const searchParams = new URLSearchParams(location.search);
    return {
      variantId: searchParams.get('variantId') || false,
    };
}


const params = getParams(window.location);
if(!params.variantId){
    loadPlp();
}
else{
    loadVariant(params.variantId);
}
