
cd /c/projects/crap.js
git add . -A
cd src
echo $1
npm version patch -m "$1"
cd ..
git add . -A
git commit -m "$1"