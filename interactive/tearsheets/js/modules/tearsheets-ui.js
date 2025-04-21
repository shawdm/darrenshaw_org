
const THUMBNAIL_COUNT = 400;

const HB_TEMPLATE_THUMBNAILS = Handlebars.compile(
    `
    <div class='thumbnails grid'>
        {{#each images}}
           {{>thumbnail_image}}
        {{/each}}
    </div>
    
    `
);

Handlebars.registerPartial(
    "thumbnail_image",
    `
    <div class='thumbnail' data-id='{{id}}' data-tag='{{tags.[0]}}'>
        <div class='palette'>
             {{#each colour_palette}}
                <div class='colour' style='background-color:{{.}}'></div>
             {{/each}}
        </div>
        <img title='{{display_text}}' src='${DATA_PATH}/{{thumbnail_path}}'/>
        
    </div>
    `
);

Handlebars.registerPartial(
    "palette_image",
    `
    <div class='palette' data-id='{{id}}'>
        {{#each colour_palette}}
            <div class='colour' style='background-color:{{.}}'></div>
        {{/each}}
    </div>
    `
);

const HB_TEMPLATE_NEXT_TOP_MODELS = Handlebars.compile(
    `
    {{#each models}}
        <li><a class='model' data-tag='{{id}}'>{{display_text}}</a> ({{count}})</li>
    {{/each}}
    `
);

const HB_TEMPLATE_TOP_MODEL = Handlebars.compile(
    `
   <a class='model' data-tag='{{id}}'>{{display_text}}</a>
    `
);


function optimalThumbnailCount(targetCount, fillWidth, thumbnailWidth){
    const items = Math.floor(fillWidth/102);
    return Math.ceil(targetCount/items) * items;
}


function displayMetadata(publishDate = "today", imageCount = "thousands"){
    var options = {year: 'numeric', month: 'long'};
    const formattedDate = new Date(publishDate).toLocaleDateString("en-GB", options)
    Array.prototype.forEach.call(document.getElementsByClassName("metadata-date"), function(metadataDateElement) {
        metadataDateElement.innerHTML = formattedDate;
    });

    Array.prototype.forEach.call(document.getElementsByClassName("metadata-count"), function(metadataCountElement) {
        metadataCountElement.innerHTML = imageCount;
    });
}

function displayImages(images, callSimilarById, displayElement){
    const html =  HB_TEMPLATE_THUMBNAILS({images: images});
    displayElement.innerHTML = html;

    const thumbnails = document.querySelectorAll('.thumbnail');
    // thumbnails.forEach(element => {
    //     element.addEventListener("click", function (e) {
    //         callSimilarById(this.dataset.id)
    //     });
    // })
}

function displayTopModels(topModelsTag){

    Array.prototype.forEach.call(document.getElementsByClassName("top-model"), function(topModelNameElement) {
        topModelNameElement.innerHTML = HB_TEMPLATE_TOP_MODEL(topModelsTag)
    });

    Array.prototype.forEach.call(document.getElementsByClassName("top-model-count"), function(topModelCountElement) {
        topModelCountElement.innerHTML = topModelsTag.count
    });
}

function displayNextTopModels(topModels, callByModelTagCallback, scroll = false){
    const topModelListItemsHtml = HB_TEMPLATE_NEXT_TOP_MODELS({models:topModels});
    Array.prototype.forEach.call(document.getElementsByClassName("next-top-models"), function(nextTopModelElement) {
        nextTopModelElement.innerHTML = topModelListItemsHtml;
    });

    const tagsElements = document.querySelectorAll('.model');
    tagsElements.forEach(element => {
        element.addEventListener("click", function (e) {
            callByModelTagCallback(this.dataset.tag)
        });
    })

    if(scroll){
        document.getElementById("content-top-model").scrollIntoView();
    }
}

export { optimalThumbnailCount, displayImages, displayTopModels, displayNextTopModels, displayMetadata};