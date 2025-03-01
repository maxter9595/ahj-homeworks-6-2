import JSZip from "jszip";
import { saveAs } from "file-saver";

class ImageGallery {
  constructor(container) {
    this.container = document.querySelector(container);
    this.dragDropArea = this.container.querySelector(".drag-drop-area");
    this.fileInput = this.container.querySelector("#file-input");
    this.gallery = this.container.querySelector(".gallery");
    this.downloadButton = this.container.querySelector(".download-button");
    this.init();
  }

  init() {
    this.dragDropArea.addEventListener("click", () => this.fileInput.click());
    this.fileInput.addEventListener("change", (e) =>
      this.handleFiles(e.target.files),
    );
    this.dragDropArea.addEventListener("dragover", (e) =>
      this.handleDragOver(e),
    );
    this.dragDropArea.addEventListener("drop", (e) => this.handleDrop(e));
    this.downloadButton.addEventListener("click", () => this.downloadImages());
  }

  handleDragOver(e) {
    e.preventDefault();
    this.dragDropArea.classList.add("dragover");
  }

  handleDrop(e) {
    e.preventDefault();
    this.dragDropArea.classList.remove("dragover");
    const files = e.dataTransfer.files;
    this.handleFiles(files);
  }

  handleFiles(files) {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => this.addImage(file.name, e.target.result);
        reader.readAsDataURL(file);
      }
    });
    this.fileInput.value = "";
  }

  addImage(name, url) {
    const imageBlock = document.createElement("div");
    imageBlock.classList.add("image-block");
    const img = document.createElement("img");
    img.src = url;
    img.alt = name;
    const closeButton = document.createElement("span");
    closeButton.classList.add("close-button");
    closeButton.innerHTML = "&times;";
    closeButton.addEventListener("click", () => imageBlock.remove());
    imageBlock.appendChild(img);
    imageBlock.appendChild(closeButton);
    this.gallery.appendChild(imageBlock);
  }

  downloadImages() {
    const zip = new JSZip();
    const images = this.gallery.querySelectorAll(".image-block img");
    const nameCounts = {};
    let unnamedCount = 1;
    images.forEach((img, index) => {
      let name = img.alt || `no_name_${unnamedCount++}`;
      if (nameCounts[name]) {
        nameCounts[name]++;
        name = `${name}_${nameCounts[name]}`;
      } else {
        nameCounts[name] = 1;
      }
      fetch(img.src)
        .then((response) => {
          if (!response.ok) {
            console.error(`Failed to fetch image: ${img.src}`);
            return;
          }
          return response.blob();
        })
        .then((blob) => {
          if (blob) {
            zip.file(`${name}.jpg`, blob);
          }
          if (index === images.length - 1) {
            zip
              .generateAsync({
                type: "blob",
              })
              .then((content) => {
                saveAs(content, "gallery.zip");
              });
          }
        })
        .catch((err) => {
          console.error("Error fetching image: ", err);
        });
    });
  }
}

export default ImageGallery;
