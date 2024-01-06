const OFFLINE_DATA_URL = "/interactive/fashion-palette/offline/data";
const DEFAULT_COLOURS = ['#fff','#fff','#fff','#fff','#fff'];

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
            <img src='/interactive/fashion-palette/offline/images/{{partNumber}}.jpg'/>
        </a>
    </div>`
)

Handlebars.registerPartial(
    "palette",
    `<div class='palette {{#if loadingPalettes}}loading{{/if}}' id='palette-{{partNumber}}'>
        <div class='colours'>
            {{>colours}}
        </div>
    </div>`
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
        <div class='colour' style='background-color:{{this}};' title='{{this}}'></div>
    {{/each}}`
)

function renderPlaceholderProducts(elementId, size){
    let products = [];
    for(let i=0; i < size; i++){
        products.push({colours:DEFAULT_COLOURS});
    }
    return renderClusters(elementId, products, true, true)
}

function renderClusters(elementId, products, isLoadingProducts, isLoadingPalettes){
    renderedProductIds = products
        .filter(product => product.partNumber)
        .map(product => product.partNumber);

    let productsHtml = HB_TEMPLATE_PRODUCTS({products: products, loadingProducts:isLoadingProducts, loadingPalettes: isLoadingPalettes});
    document.getElementById(elementId).innerHTML = productsHtml; 
    return products;
}

function loadBlackProductsOffline(){
    renderPlaceholderProducts('nap-products-black', 20)
    getNearestProductsOffline('black',20)
        .then(products => renderClusters('nap-products-black',products, false, false));
}

function loadRedProductsOffline(){
    renderPlaceholderProducts('nap-products-red', 20);
    getNearestProductsOffline('red',20)
        .then(products => renderClusters('nap-products-red',products, false, false));
}

function loadMulticolourOffline(){
    renderPlaceholderProducts('nap-products-multicolour', 20)
    getNearestProductsOffline('missoni',20)
        .then(products => renderClusters('nap-products-multicolour',products, false, false));
}

function loadStarrynightOffline(){
    renderPlaceholderProducts('nap-products-starrynight', 20)
    getNearestProductsOffline('starrynight',20)
        .then(products => renderClusters('nap-products-starrynight',products, false, false));
}


function getNearestProductsOffline(neighboursId, size){
    let neighboursUrl = OFFLINE_DATA_URL + "/neighbours-"+neighboursId+".json";

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    return fetchRetry(neighboursUrl, requestOptions, 2)
        .then(manageResponse)
        .then(products => addProductDataOffline(products,neighboursId))
        .then(products => products.slice(0,size))
        .catch(error => console.log('Error in embeddingSearchNeighbours:', error));
}

function addProductDataOffline(neighbours, neighboursId){
    let productsummaryUrl = OFFLINE_DATA_URL + "/product-"+neighboursId+".json";

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    return fetch(productsummaryUrl, requestOptions)
        .then(response => response.json())
        .then(response => mergeNeighbourProductData(neighbours,response.products))
        .catch(error => console.log('error', error));
}

// PAGE INIT
loadBlackProductsOffline();
loadRedProductsOffline();
loadMulticolourOffline();
loadStarrynightOffline();
