let slideIndex = 1;
showSlides(slideIndex);

document.addEventListener("keydown", function onEvent(event) {
  if (event.key === "ArrowLeft") {
    plusSlides(-1);
  }
  else if (event.key === "ArrowRight") {
    plusSlides(1);
  }
});

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let slides = document.getElementsByClassName("slide");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[slideIndex-1].style.display = "block";
}

