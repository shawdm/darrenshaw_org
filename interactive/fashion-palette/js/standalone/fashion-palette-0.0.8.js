const DEFAULT_COLOURS = ['#fff','#fff','#fff','#fff','#fff'];
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



function embeddingSearchSelf(searchVariantEmbeddingUrl){
    var headers = new Headers();
    headers.append(PARAM_NAME_X_IBM_CLIENT_ID, PARAM_VALUE_X_IBM_CLIENT_ID);

    var requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };

    fetchRetry(searchVariantEmbeddingUrl, requestOptions, 2)
        .then(manageResponse)
        .then(results => results[0])
        .then(renderSearchPalette)
        .catch(error => console.log('Error in embeddingSearchSelf:', error));
}

function embeddingSearchNeighbours(neighboursUrl){
    var headers = new Headers();
    headers.append(PARAM_NAME_X_IBM_CLIENT_ID, PARAM_VALUE_X_IBM_CLIENT_ID);

    var requestOptions = {
        method: 'GET',
        headers: headers,
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
    let variantIds = products.map(product => product.partNumber);

    var headers = new Headers();
    headers.append(PARAM_NAME_X_API_CLIENT_ID, PARAM_VALUE_X_API_CLIENT_ID);

    var requestOptions = {
        method: 'GET',
        redirect: 'follow',
        headers: headers
    };

    var embeddingsUrl = EMBEDDING_URL + "/self?embedding_id="+variantIds.join();
    
    fetch(embeddingsUrl, requestOptions)
        .then(response => response.json())
        .then(renderPalettes)
        .catch(error => console.log('error', error));
}
// END PLP PAGE


// VARIANT PAGE
function initVariantPage(variantId){
    renderPlaceholderProducts();

    var searchVariantEmbeddingUrl = EMBEDDING_URL + "/self?embedding_id="+variantId;
    embeddingSearchSelf(searchVariantEmbeddingUrl);

    var neighboursEmbeddingsUrl = EMBEDDING_URL + "/neighbours?embedding_id="+variantId;
    embeddingSearchNeighbours(neighboursEmbeddingsUrl);
}
// END VARIANT PAGE



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
else{
    initPlpPage();
}
// END PAGE INIT