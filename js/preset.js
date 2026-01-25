/**
 * 初始化预设页面逻辑
 */
export function initPreset() {
    // 获取所有参数项容器
    const paramItems = document.querySelectorAll('.param-item');

    paramItems.forEach(item => {
        const slider = item.querySelector('.slider');
        const numberInput = item.querySelector('.number-input');

        if (slider && numberInput) {
            // 1. 滑块拖动 -> 更新输入框
            slider.addEventListener('input', () => {
                numberInput.value = slider.value;
                updateSliderTrack(slider);
            });

            // 2. 输入框改变 -> 更新滑块
            numberInput.addEventListener('change', () => {
                let val = parseFloat(numberInput.value);
                const min = parseFloat(slider.min);
                const max = parseFloat(slider.max);

                // 限制范围
                if (val < min) val = min;
                if (val > max) val = max;
                
                numberInput.value = val;
                slider.value = val;
                updateSliderTrack(slider);
            });

            // 初始化滑块背景色
            updateSliderTrack(slider);
        }
    });
}

/**
 * 更新滑块左侧的颜色进度条 (视觉优化)
 * @param {HTMLInputElement} slider 
 */
function updateSliderTrack(slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const val = parseFloat(slider.value);
    
    const percentage = ((val - min) / (max - min)) * 100;
    
    // 使用线性渐变实现左侧蓝色，右侧灰色
    slider.style.background = `linear-gradient(to right, #4a90e2 ${percentage}%, #e0e0e0 ${percentage}%)`;
}
