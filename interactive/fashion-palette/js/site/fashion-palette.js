const PARAM_NAME_X_IBM_CLIENT_ID = "x-ibm-client-id";
const PARAM_VALUE_X_IBM_CLIENT_ID = "95f14cbd-793e-46ec-9f76-6fac2fbb6683";
const PARAM_NAME_X_API_CLIENT_ID = "x-api-key";
const PARAM_VALUE_X_API_CLIENT_ID = "4jr30M2Yh94DIq4QV3hDj9C0VsqwAYTR3yB64KpA";
const PRODUCT_SUMMARY_URL = "https://ecomm.ynap.biz/api/nap/search/resources/store/nap_gb/productview/summary";
const COLOUR_SEARCH_URL = "https://nu8k1onnk8.execute-api.us-east-1.amazonaws.com/api/nap/coloursearch";

const DEFAULT_COLOURS = ['#fff','#fff','#fff','#fff','#fff'];

const EMBEDDING_BLACK = [-74.750053,40.982098,70.300781,-35.143391,14.839152,-53.808716,22.304323,12.52072,3.605255,4.753787,-3.243726,-17.090025,-39.197884,-25.245863,8.971578];
const EMBEDDING_RED = [-113.511627,23.232147,75.255791,-47.261974,-41.850845,-48.295578,9.244069,18.236979,-1.802803,-0.646509,81.226166,-29.908506,-12.294927,-10.857877,8.761606];
const EMBEDDING_MULTICOLOUR = [-123.364113,53.724674,76.246788,-69.554024,4.122563,-43.780659,21.660303,14.192292,1.024488,0.593377,48.547581,-21.643545,-24.386423,-11.881036,20.28546];
const EMBEDDING_STARRY_NIGHT = [-68.76654,48.355072,71.41886,-39.342213,33.429768,-42.73181,24.762629,18.857775,5.4597335,-3.4968314,-0.40445945,-30.03435,-36.369892,-14.119739,13.126539];

Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

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

var HB_TEMPLATE_PALETTE = Handlebars.compile(
    `
    <div class='palette'>
        <div class='colours'>
            {{>colours}}
        </div>
    </div>
   `
);

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
    "productImage", 
    `<div class='image-container'>
        <a href='https://www.net-a-porter.com/en-gb/shop/product/{{partNumber}}'>
            <img src='https://www.net-a-porter.com/variants/images/{{partNumber}}/{{imageView}}/w300.jpg'/>
        </a>
    </div>`
)

Handlebars.registerPartial(
    "palette",
    `<a href='javascript:updateEmbedding({{json points}},{{json colours}});'>
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


function loadBlackProducts(delay){
    renderPlaceholderProducts('nap-products-black', 20)
    setTimeout(() => {
        getNearestProducts(EMBEDDING_BLACK, 20)
            .then(products => renderClusters('nap-products-black', products, false, false));
    }, delay);
   
}

function loadRedProducts(delay){
    renderPlaceholderProducts('nap-products-red', 20);
    setTimeout(() => {
    getNearestProducts(EMBEDDING_RED,20)
        .then(products => renderClusters('nap-products-red',products, false, false));
    }, delay);
}

function loadMulticolour(delay){
    renderPlaceholderProducts('nap-products-multicolour', 20)
    setTimeout(() => {
        getNearestProducts(EMBEDDING_MULTICOLOUR,20)
            .then(products => renderClusters('nap-products-multicolour',products, false, false));
    }, delay);
}

function loadStarrynightProducts(delay){
    renderPlaceholderProducts('nap-products-starrynight', 20);
    setTimeout(() => {
        getNearestProducts(EMBEDDING_STARRY_NIGHT,20)
            .then(products => renderClusters('nap-products-starrynight',products, false, false));
    }, delay);
}

function updateEmbedding(embedding, colours){
    renderPlaceholderProducts('nap-products-custom', 40);
    renderPlaceholderPaletteDescription('custom-palette', colours);
    getColourDescriptions(colours)
        .then(colourNames => renderPaletteDescription('custom-palette', colours, colourNames));
    getNearestProducts(embedding,20)
        .then(products => renderClusters('nap-products-custom', products, false, false));
    window.location = '#custom-palette';
}

function getNearestProducts(embedding, size){
    let neighboursUrl = COLOUR_SEARCH_URL + "/neighbours?embedding="+embedding+"&resultsSize="+size;

    var headers = new Headers();
    headers.append(PARAM_NAME_X_API_CLIENT_ID, PARAM_VALUE_X_API_CLIENT_ID);

    var requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };

    return fetchRetry(neighboursUrl, requestOptions, 2)
        .then(manageResponse)
        .then(addProductData)
        .then(products => products.slice(0,size))
        .catch(error => console.log('Error in embeddingSearchNeighbours:', error));
}

function getColourDescriptions(colours, size){
    let colourNameParams = colours.map(hex => 'hex='+encodeURIComponent(hex));
    let colourNamesUrl = COLOUR_SEARCH_URL + "/name?" + colourNameParams.join("&");
    
    var headers = new Headers();
    headers.append(PARAM_NAME_X_API_CLIENT_ID, PARAM_VALUE_X_API_CLIENT_ID);

    var requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };

    return fetchRetry(colourNamesUrl, requestOptions, 2)
        .then(manageResponse)
        .catch(error => console.log('Error in getColourDescriptions:', error));
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
        .then(response => mergeNeighbourProductData(neighbours,response.products))
        .catch(error => console.log('error', error));
}

function renderPlaceholderProducts(elementId, size){
    let products = [];
    for(let i=0; i < size; i++){
        products.push({colours:DEFAULT_COLOURS});
    }
    return renderClusters(elementId, products, true, true)
}

function renderPlaceholderPaletteDescription(elementId, colours){
    let backgroundCss = "linear-gradient(90deg, "+colours.join(',')+")";
    document.getElementById(elementId).style.background = backgroundCss;
    document.getElementById(elementId).classList.remove('hidden');

    let descriptionHtml = "<p>Describing colours...</p>";
    document.getElementById(elementId).innerHTML = descriptionHtml;
}

function renderClusters(elementId, products, isLoadingProducts, isLoadingPalettes){
    renderedProductIds = products
        .filter(product => product.partNumber)
        .map(product => product.partNumber);

    let productsHtml = HB_TEMPLATE_PRODUCTS({products: products, loadingProducts:isLoadingProducts, loadingPalettes: isLoadingPalettes});
    document.getElementById(elementId).innerHTML = productsHtml; 
    return products;
}

function renderPaletteDescription(elementId, colours, colourNames){
    let backgroundCss = "linear-gradient(90deg, "+colours.join(',')+")";
    document.getElementById(elementId).style.background = backgroundCss;
    document.getElementById(elementId).classList.remove('hidden');

    let descriptionHtml = "<p>" + colourNames.map(colour => colour.name).join(" & <br/> ") + ".</p>";
    document.getElementById(elementId).innerHTML = descriptionHtml;
}


// PAGE INIT
function getParams(location) {
    const searchParams = new URLSearchParams(location.search);
    return {
      embedding: searchParams.get('embedding') || false,
    };
}

const params = getParams(window.location);
loadBlackProducts(0);
loadRedProducts(0);
loadMulticolour(3000);
loadStarrynightProducts(4000);
