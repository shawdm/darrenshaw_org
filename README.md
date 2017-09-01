# darrenshaw_org
Jekyll based site for darrenshaw.org

# Development
jekyll serve --drafts
http://localhost:4000

# Deployment
Requires Jekyl Responsive Image plugin:
````gem install jekyll-responsive-image````

## Dreamhost
### Installing ImageMagick
From https://help.dreamhost.com/hc/en-us/articles/217253537-Installing-ImageMagick-and-imagick-PHP-module-on-Shared-hosting
Once you have created the /build and /local directories, proceed with the following commands. This example uses version 6.0.2-0.

````
$ cd build
$ wget "http://www.imagemagick.org/download/ImageMagick-6.9.2-0.tar.gz"
$ tar -zxvf ImageMagick-6.9.2-0.tar.gz
$ cd ImageMagick-6.9.2-0
$ ./configure --prefix=$HOME/local --enable-shared --enable-symbol-prefix
$ make
$ make install
````
If everything runs smoothly, up-to-date ImageMagick binaries, libs collection, documentation and so on are available in your "local" directory (and sub-directory).

Edit $HOME/.bash_profile and add the following:

````
export PATH=$HOME/local/bin:$PATH
export MAGICK_HOME="$HOME/local"
LD_LIBRARY_PATH="${LD_LIBRARY_PATH:+$LD_LIBRARY_PATH:}$MAGICK_HOME/lib"
export LD_LIBRARY_PATH
````


# Images
Images should be exported with width of 1350px (twice the most common required size of 675px)


# Todo
* Base starting point around 1400px width, add more columns after then.
* Scale images based on above
* Add responsive attributes for retina screens
* CV badge to be relative to header
* Add a favicon
