// SVG 處理器 - 用於生成 SVG 動畫
class SVGHandler {
  constructor() {
    this.svgNamespace = 'http://www.w3.org/2000/svg';
  }

  // 生成 SVG 動畫
  generateSVGAnimation(params) {
    const { shape, fillColor, strokeColor, size, filled, strokeWidth, mode, type, speed, duration } = params;

    // 創建 SVG 元素
    const svg = this.createSVGElement();

    // 添加背景（用於測試）
    const background = document.createElementNS(this.svgNamespace, 'rect');
    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute('fill', 'none');
    svg.appendChild(background);

    // 創建形狀元素
    const shapeElement = this.createShapeElement(shape, size, filled, strokeWidth, fillColor, strokeColor);

    // 添加動畫
    this.addAnimationToShape(shapeElement, type, mode, speed, duration);

    // 將形狀添加到 SVG
    svg.appendChild(shapeElement);

    return svg;
  }

  // 創建 SVG 根元素
  createSVGElement() {
    const svg = document.createElementNS(this.svgNamespace, 'svg');
    svg.setAttribute('width', '300');
    svg.setAttribute('height', '200');
    svg.setAttribute('viewBox', '0 0 300 200');
    svg.setAttribute('xmlns', this.svgNamespace);
    return svg;
  }

  // 創建形狀元素
  createShapeElement(shape, size, filled, strokeWidth, fillColor, strokeColor) {
    let element;
    const centerX = 150;
    const centerY = 100;

    switch (shape) {
      case 'circle':
        element = document.createElementNS(this.svgNamespace, 'circle');
        element.setAttribute('cx', centerX);
        element.setAttribute('cy', centerY);
        element.setAttribute('r', size / 2);
        break;

      case 'square':
        element = document.createElementNS(this.svgNamespace, 'rect');
        element.setAttribute('x', centerX - size / 2);
        element.setAttribute('y', centerY - size / 2);
        element.setAttribute('width', size);
        element.setAttribute('height', size);
        break;

      case 'triangle':
        element = document.createElementNS(this.svgNamespace, 'polygon');
        const height = size * Math.sqrt(3) / 2;
        const points = [
          [centerX, centerY - height / 2],
          [centerX - size / 2, centerY + height / 2],
          [centerX + size / 2, centerY + height / 2]
        ];
        element.setAttribute('points', points.map(p => p.join(',')).join(' '));
        break;

      case 'diamond':
        element = document.createElementNS(this.svgNamespace, 'polygon');
        const diamondPoints = [
          [centerX, centerY - size / 2],
          [centerX + size / 2, centerY],
          [centerX, centerY + size / 2],
          [centerX - size / 2, centerY]
        ];
        element.setAttribute('points', diamondPoints.map(p => p.join(',')).join(' '));
        break;

      case 'pentagon':
        element = this.createPolygon(centerX, centerY, size / 2, 5);
        break;

      case 'hexagon':
        element = this.createPolygon(centerX, centerY, size / 2, 6);
        break;

      case 'star':
        element = this.createStar(centerX, centerY, size / 2);
        break;

      case 'heart':
        element = this.createHeart(centerX, centerY, size);
        break;

      case 'arrow-right':
        element = this.createArrow(centerX, centerY, size, 'right');
        break;

      case 'arrow-left':
        element = this.createArrow(centerX, centerY, size, 'left');
        break;

      case 'arrow-up':
        element = this.createArrow(centerX, centerY, size, 'up');
        break;

      case 'arrow-down':
        element = this.createArrow(centerX, centerY, size, 'down');
        break;

      case 'cross':
        element = this.createCross(centerX, centerY, size);
        break;

      case 'line':
        element = document.createElementNS(this.svgNamespace, 'line');
        element.setAttribute('x1', centerX - size / 2);
        element.setAttribute('y1', centerY);
        element.setAttribute('x2', centerX + size / 2);
        element.setAttribute('y2', centerY);
        break;

      default:
        element = document.createElementNS(this.svgNamespace, 'circle');
        element.setAttribute('cx', centerX);
        element.setAttribute('cy', centerY);
        element.setAttribute('r', size / 2);
    }

    // 設定樣式
    if (filled) {
      element.setAttribute('fill', fillColor);
      element.setAttribute('stroke', strokeColor);
      element.setAttribute('stroke-width', strokeWidth);
    } else {
      element.setAttribute('fill', 'none');
      element.setAttribute('stroke', strokeColor);
      element.setAttribute('stroke-width', strokeWidth);
    }

    return element;
  }

  // 創建多邊形
  createPolygon(centerX, centerY, radius, sides) {
    const element = document.createElementNS(this.svgNamespace, 'polygon');
    const points = [];

    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      points.push([x, y]);
    }

    element.setAttribute('points', points.map(p => p.join(',')).join(' '));
    return element;
  }

  // 創建星形
  createStar(centerX, centerY, radius) {
    const element = document.createElementNS(this.svgNamespace, 'polygon');
    const outerRadius = radius;
    const innerRadius = radius * 0.4;
    const points = [];

    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      points.push([x, y]);
    }

    element.setAttribute('points', points.map(p => p.join(',')).join(' '));
    return element;
  }

  // 創建愛心
  createHeart(centerX, centerY, size) {
    const element = document.createElementNS(this.svgNamespace, 'path');
    const scale = size / 40;

    const d = `M ${centerX} ${centerY + 5 * scale}
               C ${centerX} ${centerY + 2 * scale}, ${centerX - 4 * scale} ${centerY - 2 * scale}, ${centerX - 8 * scale} ${centerY + 2 * scale}
               C ${centerX - 12 * scale} ${centerY + 6 * scale}, ${centerX - 12 * scale} ${centerY + 10 * scale}, ${centerX - 8 * scale} ${centerY + 14 * scale}
               C ${centerX - 4 * scale} ${centerY + 18 * scale}, ${centerX} ${centerY + 22 * scale}, ${centerX} ${centerY + 22 * scale}
               C ${centerX} ${centerY + 22 * scale}, ${centerX + 4 * scale} ${centerY + 18 * scale}, ${centerX + 8 * scale} ${centerY + 14 * scale}
               C ${centerX + 12 * scale} ${centerY + 10 * scale}, ${centerX + 12 * scale} ${centerY + 6 * scale}, ${centerX + 8 * scale} ${centerY + 2 * scale}
               C ${centerX + 4 * scale} ${centerY - 2 * scale}, ${centerX} ${centerY + 2 * scale}, ${centerX} ${centerY + 5 * scale} Z`;

    element.setAttribute('d', d);
    return element;
  }

  // 創建箭頭
  createArrow(centerX, centerY, size, direction) {
    const element = document.createElementNS(this.svgNamespace, 'polygon');
    let points = [];

    const width = size;
    const height = size * 0.6;

    switch (direction) {
      case 'right':
        points = [
          [centerX - width/2, centerY - height/4],
          [centerX + width/4, centerY - height/4],
          [centerX + width/4, centerY - height/2],
          [centerX + width/2, centerY],
          [centerX + width/4, centerY + height/2],
          [centerX + width/4, centerY + height/4],
          [centerX - width/2, centerY + height/4]
        ];
        break;
      case 'left':
        points = [
          [centerX + width/2, centerY - height/4],
          [centerX - width/4, centerY - height/4],
          [centerX - width/4, centerY - height/2],
          [centerX - width/2, centerY],
          [centerX - width/4, centerY + height/2],
          [centerX - width/4, centerY + height/4],
          [centerX + width/2, centerY + height/4]
        ];
        break;
      case 'up':
        points = [
          [centerX - height/4, centerY + width/2],
          [centerX - height/4, centerY - width/4],
          [centerX - height/2, centerY - width/4],
          [centerX, centerY - width/2],
          [centerX + height/2, centerY - width/4],
          [centerX + height/4, centerY - width/4],
          [centerX + height/4, centerY + width/2]
        ];
        break;
      case 'down':
        points = [
          [centerX - height/4, centerY - width/2],
          [centerX - height/4, centerY + width/4],
          [centerX - height/2, centerY + width/4],
          [centerX, centerY + width/2],
          [centerX + height/2, centerY + width/4],
          [centerX + height/4, centerY + width/4],
          [centerX + height/4, centerY - width/2]
        ];
        break;
    }

    element.setAttribute('points', points.map(p => p.join(',')).join(' '));
    return element;
  }

  // 創建十字
  createCross(centerX, centerY, size) {
    const element = document.createElementNS(this.svgNamespace, 'g');
    const thickness = size * 0.2;

    // 垂直線
    const vLine = document.createElementNS(this.svgNamespace, 'rect');
    vLine.setAttribute('x', centerX - thickness / 2);
    vLine.setAttribute('y', centerY - size / 2);
    vLine.setAttribute('width', thickness);
    vLine.setAttribute('height', size);

    // 水平線
    const hLine = document.createElementNS(this.svgNamespace, 'rect');
    hLine.setAttribute('x', centerX - size / 2);
    hLine.setAttribute('y', centerY - thickness / 2);
    hLine.setAttribute('width', size);
    hLine.setAttribute('height', thickness);

    element.appendChild(vLine);
    element.appendChild(hLine);

    return element;
  }

  // 添加動畫到形狀
  addAnimationToShape(element, type, mode, speed, duration) {
    const animationDuration = speed / 1000;

    switch (type) {
      case 'bounce':
        this.addBounceAnimation(element, animationDuration, mode);
        break;
      case 'pulse':
        this.addPulseAnimation(element, animationDuration, mode);
        break;
      case 'rotate':
        this.addRotateAnimation(element, animationDuration, mode);
        break;
      case 'swing':
        this.addSwingAnimation(element, animationDuration, mode);
        break;
      case 'fade':
        this.addFadeAnimation(element, animationDuration, mode);
        break;
      case 'slide':
        this.addSlideAnimation(element, animationDuration, mode);
        break;
      case 'zoom':
        this.addZoomAnimation(element, animationDuration, mode);
        break;
      case 'spin':
        this.addSpinAnimation(element, animationDuration, mode);
        break;
      default:
        // 預設使用彈跳動畫
        this.addBounceAnimation(element, animationDuration, mode);
        break;
    }
  }

  // 彈跳動畫
  addBounceAnimation(element, duration, mode) {
    const animateTransform = document.createElementNS(this.svgNamespace, 'animateTransform');
    animateTransform.setAttribute('attributeName', 'transform');
    animateTransform.setAttribute('type', 'translate');
    animateTransform.setAttribute('values', '0,0; 0,-60; 0,0');
    animateTransform.setAttribute('dur', duration + 's');
    animateTransform.setAttribute('repeatCount', mode === 'loop' ? 'indefinite' : '1');
    animateTransform.setAttribute('calcMode', 'spline');
    animateTransform.setAttribute('keySplines', '0.25 0.1 0.25 1; 0.25 0.1 0.25 1');
    animateTransform.setAttribute('keyTimes', '0; 0.5; 1');
    element.appendChild(animateTransform);
  }

  // 脈衝動畫
  addPulseAnimation(element, duration, mode) {
    const animateTransform = document.createElementNS(this.svgNamespace, 'animateTransform');
    animateTransform.setAttribute('attributeName', 'transform');
    animateTransform.setAttribute('type', 'scale');
    animateTransform.setAttribute('values', '0.7; 1.3; 0.7');
    animateTransform.setAttribute('dur', duration + 's');
    animateTransform.setAttribute('repeatCount', mode === 'loop' ? 'indefinite' : '1');
    animateTransform.setAttribute('additive', 'sum');
    element.appendChild(animateTransform);
  }

  // 旋轉動畫
  addRotateAnimation(element, duration, mode) {
    const animateTransform = document.createElementNS(this.svgNamespace, 'animateTransform');
    animateTransform.setAttribute('attributeName', 'transform');
    animateTransform.setAttribute('type', 'rotate');
    animateTransform.setAttribute('values', '0 150 100; 360 150 100');
    animateTransform.setAttribute('dur', duration + 's');
    animateTransform.setAttribute('repeatCount', mode === 'loop' ? 'indefinite' : '1');
    element.appendChild(animateTransform);
  }

  // 淡入淡出動畫
  addFadeAnimation(element, duration, mode) {
    const animate = document.createElementNS(this.svgNamespace, 'animate');
    animate.setAttribute('attributeName', 'opacity');
    animate.setAttribute('values', '0.3; 1; 0.3');
    animate.setAttribute('dur', duration + 's');
    animate.setAttribute('repeatCount', mode === 'loop' ? 'indefinite' : '1');
    element.appendChild(animate);
  }

  // 滑動動畫
  addSlideAnimation(element, duration, mode) {
    const animateTransform = document.createElementNS(this.svgNamespace, 'animateTransform');
    animateTransform.setAttribute('attributeName', 'transform');
    animateTransform.setAttribute('type', 'translate');
    animateTransform.setAttribute('values', '-100,0; 100,0; -100,0');
    animateTransform.setAttribute('dur', duration + 's');
    animateTransform.setAttribute('repeatCount', mode === 'loop' ? 'indefinite' : '1');
    element.appendChild(animateTransform);
  }

  // 縮放動畫
  addZoomAnimation(element, duration, mode) {
    const animateTransform = document.createElementNS(this.svgNamespace, 'animateTransform');
    animateTransform.setAttribute('attributeName', 'transform');
    animateTransform.setAttribute('type', 'scale');
    animateTransform.setAttribute('values', '0.5; 1.5; 0.5');
    animateTransform.setAttribute('dur', duration + 's');
    animateTransform.setAttribute('repeatCount', mode === 'loop' ? 'indefinite' : '1');
    animateTransform.setAttribute('additive', 'sum');
    element.appendChild(animateTransform);
  }

  // 將 SVG 轉換為字串
  svgToString(svg) {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    // 添加 XML 聲明，確保 SVG 格式正確
    return `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;
  }

  // 擺動動畫
  addSwingAnimation(element, duration, mode) {
    const animateTransform = document.createElementNS(this.svgNamespace, 'animateTransform');
    animateTransform.setAttribute('attributeName', 'transform');
    animateTransform.setAttribute('type', 'rotate');
    animateTransform.setAttribute('values', '0 150 100; 15 150 100; -15 150 100; 0 150 100');
    animateTransform.setAttribute('dur', duration + 's');
    animateTransform.setAttribute('repeatCount', mode === 'loop' ? 'indefinite' : '1');
    animateTransform.setAttribute('calcMode', 'spline');
    animateTransform.setAttribute('keySplines', '0.25 0.1 0.25 1; 0.25 0.1 0.25 1; 0.25 0.1 0.25 1');
    animateTransform.setAttribute('keyTimes', '0; 0.33; 0.66; 1');
    element.appendChild(animateTransform);
  }

  // 自旋動畫
  addSpinAnimation(element, duration, mode) {
    const animateTransform = document.createElementNS(this.svgNamespace, 'animateTransform');
    animateTransform.setAttribute('attributeName', 'transform');
    animateTransform.setAttribute('type', 'rotate');
    animateTransform.setAttribute('values', '0 150 100; 360 150 100');
    animateTransform.setAttribute('dur', duration + 's');
    animateTransform.setAttribute('repeatCount', mode === 'loop' ? 'indefinite' : '1');
    element.appendChild(animateTransform);
  }

  // 下載 SVG 檔案 (已棄用 - 使用輸出管理器)
  downloadSVG(svg, filename) {
    console.warn('⚠️ downloadSVG 方法已棄用，請使用輸出管理器');
    // 為了向後相容，暫時保留但不執行下載
    const svgString = this.svgToString(svg);
    console.log('SVG 內容已生成，但未下載。請使用輸出管理器。');
    return svgString;
  }

  // 獲取 SVG 字串 (用於輸出管理器)
  getSVGString(svg) {
    return this.svgToString(svg);
  }
}

// 匯出類別
window.SVGHandler = SVGHandler;
