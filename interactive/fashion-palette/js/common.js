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

function base64ImageSizeKb(base64Image){
    return Math.ceil(3*(base64Image.length/4))/1024;
}