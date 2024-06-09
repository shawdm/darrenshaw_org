# darrenshaw_org
Jekyll based site for darrenshaw.org

# Design
The `design` directory contains
** inprogress site visual designs
** artwork for posts
** fonts
** photoshop processors for image resizing

# Images
## Gallery 
** w800px

## Full Width
** w2400px

## Slidshow
** Long edge 2000px

## Article
** w1400px

Filenames cannot start with `_`.

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

# Todo
* Add a favicon.
* Merge `blog-photo-post` with `blog-photo-portait` layouts and css.
* Remove unneeded files from s3
* Add title to Valencia images.
* Styling of Twombly to be in site style.
* Update README image instructions.
