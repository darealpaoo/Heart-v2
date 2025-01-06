import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { MeshStandardMaterial, Mesh, Color } from "three";

export class Text3D {
  constructor(scene) {
    this.scene = scene;
    this.loader = new FontLoader();
    this.currentText = null;
    this.textPosition = { x: 0, y: 45, z: -50 };
  }

  // Function to get parameter from URL
  getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  async createMessageBox(isWelcome = true) {
    const message = this.getUrlParam("message");
    const name = this.getUrlParam("name") || "...";
    const lang = this.getUrlParam("lang") || "EN";
    const languageData = await fetch("./src/lang/lang.json").then((res) =>
      res.json()
    );

    const decodedMessage = message ? decodeMessage(message) : "";

    const text = isWelcome
      ? languageData[lang].welcomeMessage
      : message
      ? languageData[lang].message
          .replace("{name}", name)
          .replace("{message}", decodeMessage(message))
      : languageData[lang].defaultMessage.replace("{name}", name);

    return new Promise((resolve) => {
      this.loader.load(
        "./src/assets/fonts/Noto Sans_Regular.json",
        async (font) => {
          // Cleanup old text
          if (this.currentText) {
            if (Array.isArray(this.currentText)) {
              this.currentText.forEach((letter) => {
                if (letter.geometry) {
                  letter.geometry.dispose();
                }
                if (letter.material) {
                  letter.material.dispose();
                }
                this.scene.remove(letter);
              });
            } else {
              if (this.currentText.geometry) {
                this.currentText.geometry.dispose();
              }
              if (this.currentText.material) {
                this.currentText.material.dispose();
              }
              this.scene.remove(this.currentText);
            }
          }

          if (isWelcome) {
            // Welcome text - single mesh
            const geometry = new TextGeometry(text, {
              font: font,
              size: 5,
              depth: 2,
              curveSegments: 12,
              bevelEnabled: true,
              bevelThickness: 0.5,
              bevelSize: 0.3,
            });

            const material = new MeshStandardMaterial({
              color: 0xffffff,
              metalness: 0,
              roughness: 0.2,
              emissive: 0xffffff,
              emissiveIntensity: 0.2,
            });

            const mesh = new Mesh(geometry, material);
            geometry.computeBoundingBox();
            const centerOffset =
              -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
            mesh.position.set(
              centerOffset,
              this.textPosition.y,
              this.textPosition.z
            );

            this.scene.add(mesh);
            this.currentText = mesh;
            resolve(mesh);
          } else {
            // Birthday text - letter by letter with rainbow effect
            const letters = [];
            let currentX = -70;
            let currentY = this.textPosition.y + 15;
            const lineHeight = 10;

            const lines = text.split("\n");
            const lineWidths = lines.map((line) => {
              let width = 0;
              for (let char of line) {
                if (char === " ") {
                  width += 3;
                  continue;
                }
                const tempGeometry = new TextGeometry(char, {
                  font: font,
                  size: 5,
                  depth: 2,
                  curveSegments: 12,
                  bevelEnabled: true,
                  bevelThickness: 0.5,
                  bevelSize: 0.3,
                });
                tempGeometry.computeBoundingBox();
                width +=
                  tempGeometry.boundingBox.max.x -
                  tempGeometry.boundingBox.min.x +
                  1;
                tempGeometry.dispose();
              }
              return width;
            });

            const maxWidth = Math.max(...lineWidths);
            let currentLine = 0;

            const animateLetterAppear = (letterMesh, isInitial = true) => {
              const startTime = performance.now();
              const initialDuration = 500;

              const animate = () => {
                const now = performance.now();
                const elapsed = now - startTime;

                if (isInitial && elapsed < initialDuration) {
                  const progress = elapsed / initialDuration;

                  const scale = 1 + (1 - progress) * 0.5;
                  letterMesh.scale.set(scale, scale, scale);

                  letterMesh.material.opacity = progress;

                  requestAnimationFrame(animate);
                }
              };

              animate();
            };

            const addLetter = async (index) => {
              if (index >= text.length) {
                this.currentText = letters;

                letters.forEach((letter) => {
                  letter.scale.set(1, 1, 1);
                });

                resolve(letters);
                return;
              }

              const char = text[index];

              if (char === "\n") {
                currentLine++;
                currentX = -maxWidth / 2;
                currentY -= lineHeight;
                setTimeout(() => addLetter(index + 1), 50);
                return;
              }

              if (char === " ") {
                currentX += 3;
                setTimeout(() => addLetter(index + 1), 50);
                return;
              }

              const geometry = new TextGeometry(char, {
                font: font,
                size: 5,
                depth: 2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.5,
                bevelSize: 0.3,
              });

              const material = new MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.3,
                roughness: 0.3,
                transparent: true,
                opacity: 0,
                emissive: 0xffffff,
                emissiveIntensity: 0.1,
              });

              const letterMesh = new Mesh(geometry, material);
              letterMesh.position.set(currentX, currentY, this.textPosition.z);

              this.scene.add(letterMesh);
              letters.push(letterMesh);

              animateLetterAppear(letterMesh, true);

              geometry.computeBoundingBox();
              const letterWidth =
                geometry.boundingBox.max.x - geometry.boundingBox.min.x;
              currentX += letterWidth + 1;

              setTimeout(() => addLetter(index + 1), 100);
            };

            currentX = -lineWidths[0] / 2;
            addLetter(0);
          }
        }
      );
    });
  }

  async glitchEffect(mesh, duration = 1000, interval = 30) {
    return new Promise((resolve) => {
      let opacity = 1;
      const fadeStep = 0.05;
      const originalColor = mesh.material.color.clone();
      const originalEmissive = mesh.material.emissive.clone();

      const glitchInterval = setInterval(() => {
        if (opacity > 0) {
          const glitchAmount = opacity * 0.2;
          mesh.material.color.setRGB(
            originalColor.r + (Math.random() - 0.5) * glitchAmount,
            originalColor.g + (Math.random() - 0.5) * glitchAmount,
            originalColor.b + (Math.random() - 0.5) * glitchAmount
          );
          mesh.material.emissiveIntensity = 0.2 + Math.random() * 0.3 * opacity;
          mesh.material.opacity = opacity;
          opacity -= fadeStep;
        } else {
          clearInterval(glitchInterval);
          mesh.material.color.copy(originalColor);
          mesh.material.emissive.copy(originalEmissive);
          this.scene.remove(mesh);
          resolve();
        }
      }, interval);
    });
  }
}
