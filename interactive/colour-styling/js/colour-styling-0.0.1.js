const STYLING_BASE_URL = 'http://localhost:8081/v1/nap/styling';



const HB_TEMPLATE_CLUSTERS = Handlebars.compile(
    `<div class='clusters'>
        {{#.}}
            {{>cluster}}
        {{/.}}
    </div>
    `
);

const HB_TEMPLATE_PRODUCTS = Handlebars.compile(
    `{{>products products=.}}`
);

Handlebars.registerPartial(
    'cluster',
    `<div class='cluster'>
        {{clusterId}}
        {{>products products=neighbours}}
    </div>
    `
);

Handlebars.registerPartial(
    'products',
    `<ul class='products'>
        {{#each products}}
            {{>product}}
        {{/each}}
    </ul>
    `
);

Handlebars.registerPartial(
    "product", 
    `<li class='product'>
        {{>productImage}}
    </li>`
)
Handlebars.registerPartial(
    "productImage", 
    `<div class='image-container'>
        <a href='https://www.net-a-porter.com/en-gb/shop/product/{{partNumber}}'>
            <img src='https://www.net-a-porter.com/variants/images/{{partNumber}}/in/w300.jpg'/>
        </a>
    </div>`
)

Handlebars.registerPartial(
    "productDetails", 
    `<div class='product-details'>
        <h4>PRODUCT DETAILS/h4>
    </div>`
)

function init(){
    console.log('colour styling is go...');
    // loadProductClusters()
    //     .then(addProductDetails)
    //     .then(renderClusters);
    
    loadSortedProducts()
        .then(addProductDetails)
        .then(renderProducts);

    //     .then(renderClusters);
}

function loadSortedProducts(){
    let productsPlp = STYLING_BASE_URL + '/coloursort?embedding_ids=29419655932710672,29419655932710189,42247633207844141,1647597281915561,46376663162666987,29419655932708791,36093695688826924,36093695688826937,29419655932708788,42247633207844129,36594538430068070,42247633207844165,33258524072096185,36856120584982071,46376663162666941,36093695688869191,38063312420610637,36856120585433924,36093695689006927,36856120585433925,32027475399326769,36856120585433927,29419655932713085,38063312419661328,36856120585433931,36093695689006931,34344356236785854,36856120585433929,38063312420559757,38063312418732073,36856120585433922,38063312420538080,38063312420510302,38063312420647348,38063312419661326,33258524072570228,36093695689006935,38063312420503454,38063312420168076,38063312419752066,38063312419661322,33258524071916076,38063312420510510,36856120584982068,33258524071916090,38063312419661325,38063312420510567,38063312420578427,34344356236892925,33258524072570236,36093695689006943,38063312420547714,38063312420503460,34344356236892930,38063312420510537,31840166392199840,38063312420503470,33258524072000701,38063312419661320,36093695689006933,38063312419858923,42247633207892118,38063312420734173,33258524071916101,42247633207892128,33258524072570238,36093695689006938,33258524072105123,36856120585160769,38063312420734147,38063312420568546,38063312420568490,38063312419752070,42247633207923509,42247633208312149,1647597283077555",38063312420734118,33258524071916079,38063312420734068,33258524072761267,38063312419661323,38063312420418297,38063312420734105,42247633207887504,36856120584999602,36856120584981854,33258524072667263,38063312418943986,45666037505038759,45666037505038781,45666037505038767,33258524071916068,33258524072560904,45666037505038823,38063312418732059,34344356237567471,38063312421023209,38063312418732062,38063312420568823,33258524072560759&groups=12';

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    return fetchRetry(productsPlp, requestOptions, 2)
        .then(manageResponse)
        .catch(error => console.log('Error in loadPlp:', error));
}

function loadProductClusters(){
    let productsPlp = STYLING_BASE_URL + '/colourcluster?embedding_ids=29419655932710672,29419655932710189,42247633207844141,1647597281915561,46376663162666987,29419655932708791,36093695688826924,36093695688826937,29419655932708788,42247633207844129,36594538430068070,42247633207844165,33258524072096185,36856120584982071,46376663162666941,36093695688869191,38063312420610637,36856120585433924,36093695689006927,36856120585433925,32027475399326769,36856120585433927,29419655932713085,38063312419661328,36856120585433931,36093695689006931,34344356236785854,36856120585433929,38063312420559757,38063312418732073,36856120585433922,38063312420538080,38063312420510302,38063312420647348,38063312419661326,33258524072570228,36093695689006935,38063312420503454,38063312420168076,38063312419752066,38063312419661322,33258524071916076,38063312420510510,36856120584982068,33258524071916090,38063312419661325,38063312420510567,38063312420578427,34344356236892925,33258524072570236,36093695689006943,38063312420547714,38063312420503460,34344356236892930,38063312420510537,31840166392199840,38063312420503470,33258524072000701,38063312419661320,36093695689006933,38063312419858923,42247633207892118,38063312420734173,33258524071916101,42247633207892128,33258524072570238,36093695689006938,33258524072105123,36856120585160769,38063312420734147,38063312420568546,38063312420568490,38063312419752070,42247633207923509,42247633208312149,1647597283077555",38063312420734118,33258524071916079,38063312420734068,33258524072761267,38063312419661323,38063312420418297,38063312420734105,42247633207887504,36856120584999602,36856120584981854,33258524072667263,38063312418943986,45666037505038759,45666037505038781,45666037505038767,33258524071916068,33258524072560904,45666037505038823,38063312418732059,34344356237567471,38063312421023209,38063312418732062,38063312420568823,33258524072560759&groups=30';

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    return fetchRetry(productsPlp, requestOptions, 2)
        .then(manageResponse)
        .catch(error => console.log('Error in loadPlp:', error));
}

function addClusterProductDetails(clusters){
    return clusters
        .map(cluster => {
            let products = cluster.neighbours.map(product => {
                let productData = {
                    partNumber: product.id,
    
                }
                return productData;
            })
            cluster.neighbours = products;
            return cluster;
        });
}

function addProductDetails(products){
    return products.map(product => {
        let productData = {
            partNumber: product.id,

        }
        return productData;
    });
}



function renderClusters(clusters){
    let elementId = 'nap-products';
    let productsHtml = HB_TEMPLATE_CLUSTERS(clusters);
    document.getElementById(elementId).innerHTML = productsHtml; 
    return clusters;
}

function renderProducts(products){
    let elementId = 'nap-products';
    let productsHtml = HB_TEMPLATE_PRODUCTS(products);
    document.getElementById(elementId).innerHTML = productsHtml; 
    return products;
}

function fetchRetry(url, options, retries){
    console.log('retries: ' + retries);
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
            if(retries > 0){
                retries = retries - 1;
                return fetchRetry(url, options, retries);
            }
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


init();