# darrenshaw_org
Jekyll based site for darrenshaw.org

# Design
The `design` directory contains
** inprogress site visual designs
** artwork for posts
** fonts
** photoshop processors for image resizing

# Images
Original images are stored in `images/original`. Original images are not published to site.

Resized images need to be added to the `300` and `2720` subdirectories which are published to site. Photoshop processors to do this are in the `design` directory.

The `sized` directory which is published to site stores images that should not be resized.


# Development
## OSX Prereqs
1. Ruby
2. Bundler

## Startup
```
bundle install
bundle exec jekyll serve --drafts
```

Will start the site on: ``http://localhost:4000``

# Deployment
```
make
```

# Todo
* Add a favicon
