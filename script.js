function setVh() {
    // Calculate 1% of the viewport height
    let vh = window.innerHeight * 0.01;
    // Set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Initial setting
setVh();

// Update the value on resize (optional, but useful for dynamic UIs)
window.addEventListener('resize', setVh);