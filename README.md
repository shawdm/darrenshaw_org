# darrenshaw_org
Jekyll based site for darrenshaw.org

# Design
The `design` directory contains
* inprogress site visual designs
* artwork for posts
* fonts
* photoshop processors for image resizing

# Images
All images should be in avif format. Images for the photography homepage `images/gallery` should be 800px wide. Images for an individual photography gallery (e.g. `images/photo/2024-june-emily`) should have their long edge as 2400px. Images for an article should be 1400px wide

Filenames cannot start with `_`.

Images can be converted to avif format using ImageMagick. The following commands will convert all `.tif` files in the current directory to `.avif`. 
```
magick mogrify -format avif *.tif
```

# Favicons
Created at https://favicon.io

# Development

## OSX Prereqs
1. Ruby
2. Bundler
3. AWS CLI

## Startup
```
bundle install
JEKYLL_ENV=dev  bundle exec jekyll serve
```

Will start the site on: ``http://localhost:4000``

The setting JEKYLL_ENV to dev means relative image URLs will be generated. For production absolute URLs are used to ensure images load in RSS readers.


# Deployment
```
make
```

# Configuration
## Playlists
To update the current year the site just needs rebuilding. The year is taken from the `{{site.time}}`.

# Todo
* Add a favicon.
* Merge `blog-photo-post` with `blog-photo-portait` layouts and css.
* Remove unneeded files from s3
* Add title to Valencia images.
* Styling of Twombly to be in site style.
* Update README image instructions.
