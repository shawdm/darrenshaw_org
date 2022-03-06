# darrenshaw_org
Jekyll based site for darrenshaw.org


# Development
## OSX Prereqs
```
brew unlink imagemagick
brew install imagemagick@6 && brew link imagemagick@6 --force
```
## Startup
```
bundle exec jekyll serve --drafts
```

Will start the site on: ``http://localhost:4000``

# Deployment
Requires Jekyl Responsive Image plugin:
```
gem install jekyll-responsive-image
```

# Todo
* Add a favicon
