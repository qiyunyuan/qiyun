/**
 * 初始化 API 设置页面的交互逻辑
 */
export function initApiSettings() {
    /* =================================
       数据状态
       ================================= */
    let allModels = []; // 存储所有拉取的模型
    let currentTab = 'all'; // 当前标签页: 'all' 或 'fav'
    
    // 从 LocalStorage 读取收藏的模型 ID 列表
    let favoriteModelIds = [];
    try {
        const saved = localStorage.getItem('favorite_models');
        if (saved) {
            favoriteModelIds = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load favorites', e);
    }

    /* =================================
       DOM 元素获取
       ================================= */
    const modal = document.getElementById('modal-model-select');
    const btnOpenModal = document.getElementById('model-select-trigger');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const modelListContainer = document.querySelector('.model-list');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const btnFetch = document.querySelector('.btn-fetch');
    
    // 输入框
    const apiAddressInput = document.querySelector('.api-group input[placeholder="请输入 API 地址"]');
    const apiKeyInput = document.querySelector('.api-group input[placeholder="请输入 API 密钥"]');
    const modelSelectTrigger = document.getElementById('model-select-trigger'); // 显示选中的模型

    // 新增按钮
    const quotaBtns = document.querySelectorAll('.quota-btn');
    const btnTest = document.querySelector('.btn-test');
    const btnSave = document.querySelector('.btn-save');

    /* =================================
       初始化：加载保存的设置
       ================================= */
    function loadSettings() {
        try {
            const savedSettings = localStorage.getItem('api_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                
                if (settings.apiAddress) apiAddressInput.value = settings.apiAddress;
                if (settings.apiKey) apiKeyInput.value = settings.apiKey;
                
                if (settings.model) {
                    modelSelectTrigger.textContent = settings.model;
                    modelSelectTrigger.classList.add('has-value');
                    modelSelectTrigger.dataset.value = settings.model;
                }

                if (settings.quotaStatus) {
                    quotaBtns.forEach(btn => {
                        if (btn.textContent.trim() === settings.quotaStatus) {
                            btn.classList.add('active');
                        } else {
                            btn.classList.remove('active');
                        }
                    });
                }
            }
        } catch (e) {
            console.error('Failed to load settings', e);
        }
    }
    
    // 立即加载设置
    loadSettings();

    /* =================================
       功能函数
       ================================= */

    /**
     * 渲染模型列表
     */
    function renderModelList() {
        if (!modelListContainer) return;
        modelListContainer.innerHTML = '';

        let modelsToRender = [];
        if (currentTab === 'fav') {
            if (allModels.length > 0) {
                 modelsToRender = allModels.filter(m => favoriteModelIds.includes(m.id));
            } else {
                 modelsToRender = [];
            }
        } else {
            modelsToRender = allModels;
        }

        if (modelsToRender.length === 0) {
            modelListContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#999;">暂无模型数据</div>';
            return;
        }

        modelsToRender.forEach(model => {
            const isFav = favoriteModelIds.includes(model.id);
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'model-item';
            
            // 星星图标
            const starSpan = document.createElement('span');
            starSpan.className = `star-icon ${isFav ? 'active' : ''}`;
            // 空心星星 ☆ (unicode 2606), 实心星星 ★ (unicode 2605)
            starSpan.textContent = isFav ? '★' : '☆';
            
            if (isFav) {
                starSpan.style.color = '#ffd700';
                starSpan.classList.add('fav');
            } else {
                starSpan.style.color = '';
                starSpan.classList.remove('fav');
            }
            
            starSpan.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止触发选中模型
                toggleFavorite(model.id, starSpan);
            });

            // 模型名称
            const nameDiv = document.createElement('div');
            nameDiv.className = 'model-name';
            nameDiv.textContent = model.id;
            
            nameDiv.addEventListener('click', () => {
                selectModel(model.id);
            });

            itemDiv.appendChild(starSpan);
            itemDiv.appendChild(nameDiv);
            modelListContainer.appendChild(itemDiv);
        });
    }

    /**
     * 切换收藏状态
     */
    function toggleFavorite(modelId, starElement) {
        const index = favoriteModelIds.indexOf(modelId);
        if (index === -1) {
            // 添加收藏
            favoriteModelIds.push(modelId);
            starElement.classList.add('fav');
            starElement.textContent = '★';
            starElement.style.color = '#ffd700';
        } else {
            // 取消收藏
            favoriteModelIds.splice(index, 1);
            starElement.classList.remove('fav');
            starElement.textContent = '☆';
            starElement.style.color = '';
            
            // 如果当前在"常用"标签页，取消收藏后应立即移除该项
            if (currentTab === 'fav') {
                renderModelList();
            }
        }
        // 保存到 LocalStorage
        localStorage.setItem('favorite_models', JSON.stringify(favoriteModelIds));
    }

    /**
     * 选中模型
     */
    function selectModel(modelId) {
        if (modelSelectTrigger) {
            modelSelectTrigger.textContent = modelId;
            modelSelectTrigger.classList.add('has-value');
            modelSelectTrigger.dataset.value = modelId; // 存储实际值
        }
        closeModal();
    }

    /**
     * 打开弹窗
     */
    function openModal() {
        if (modal) modal.classList.add('active');
        renderModelList(); // 每次打开重新渲染，确保状态最新
    }

    /**
     * 关闭弹窗
     */
    function closeModal() {
        if (modal) modal.classList.remove('active');
    }

    /**
     * 处理 API URL
     */
    function normalizeUrl(inputUrl, type = 'models') {
        let url = inputUrl.trim();
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }
        // 移除末尾斜杠
        if (url.endsWith('/')) {
            url = url.slice(0, -1);
        }

        if (type === 'models') {
             // 尝试智能补全 /v1/models
             if (url.endsWith('/models')) return url;
             if (url.endsWith('/v1')) return url + '/models';
             return url + '/v1/models';
        } else if (type === 'chat') {
            // 尝试智能补全 /v1/chat/completions
            if (url.endsWith('/chat/completions')) return url;
            if (url.endsWith('/models')) return url.replace('/models', '/chat/completions');
            if (url.endsWith('/v1')) return url + '/chat/completions';
            return url + '/v1/chat/completions';
        }
        return url;
    }

    /**
     * 拉取模型
     */
    async function fetchModels() {
        const apiAddress = apiAddressInput.value.trim();
        const apiKey = apiKeyInput.value.trim();

        if (!apiAddress) {
            alert('请输入 API 地址');
            return;
        }
        
        const url = normalizeUrl(apiAddress, 'models');
        
        const btnOriginalText = btnFetch.textContent;
        btnFetch.textContent = '拉取中...';
        btnFetch.disabled = true;

        try {
            const headers = {};
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data && Array.isArray(data.data)) {
                allModels = data.data;
                openModal();
            } else if (Array.isArray(data)) {
                allModels = data;
                openModal();
            } else {
                alert('无法解析返回的模型数据格式');
                console.log('API Response:', data);
            }

        } catch (error) {
            console.error('Fetch models error:', error);
            alert('拉取模型失败，请检查地址和网络');
        } finally {
            btnFetch.textContent = btnOriginalText;
            btnFetch.disabled = false;
        }
    }

    /**
     * 测试模型
     */
    async function testModel() {
        const apiAddress = apiAddressInput.value.trim();
        const apiKey = apiKeyInput.value.trim();
        const model = modelSelectTrigger.dataset.value;

        if (!apiAddress) {
            alert('请输入 API 地址');
            return;
        }
        if (!model) {
            alert('请先选择模型');
            return;
        }

        const url = normalizeUrl(apiAddress, 'chat');

        const btnOriginalText = btnTest.textContent;
        btnTest.textContent = '测试中...';
        btnTest.disabled = true;

        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'user', content: 'Hi' }
                    ],
                    max_tokens: 5
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.message || `HTTP ${response.status}`);
            }

            alert('测试成功！模型连接正常。');

        } catch (error) {
            console.error('Test model error:', error);
            alert('测试失败: ' + error.message);
        } finally {
            btnTest.textContent = btnOriginalText;
            btnTest.disabled = false;
        }
    }

    /**
     * 保存设置
     */
    function saveSettings() {
        const apiAddress = apiAddressInput.value.trim();
        const apiKey = apiKeyInput.value.trim();
        const model = modelSelectTrigger.dataset.value || '';
        
        let quotaStatus = '有额度';
        const activeQuotaBtn = document.querySelector('.quota-btn.active');
        if (activeQuotaBtn) {
            quotaStatus = activeQuotaBtn.textContent.trim();
        }

        const settings = {
            apiAddress,
            apiKey,
            model,
            quotaStatus
        };

        localStorage.setItem('api_settings', JSON.stringify(settings));
        // 使用 showToast 替代 alert，避免打断操作，且在 loadConfig 时不会弹出烦人的窗口
        if (typeof showToast === 'function') {
            showToast('设置已保存');
        }
    }

    /* =================================
       事件监听
       ================================= */
    
    // 打开弹窗
    if (btnOpenModal) {
        btnOpenModal.addEventListener('click', openModal);
    }

    // 关闭弹窗
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', closeModal);
    }

    // 点击遮罩关闭
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // 选项卡切换
    tabBtns.forEach((btn) => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            if (this.textContent.trim() === '全部') {
                currentTab = 'all';
            } else {
                currentTab = 'fav';
            }
            renderModelList();
        });
    });

    // 拉取模型按钮
    if (btnFetch) {
        btnFetch.addEventListener('click', fetchModels);
    }

    // 额度按钮切换
    quotaBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            quotaBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 测试模型按钮
    if (btnTest) {
        btnTest.addEventListener('click', testModel);
    }

    // 保存设置按钮
    if (btnSave) {
        btnSave.addEventListener('click', saveSettings);
    }

    /* =================================
       API 配置管理逻辑
       ================================= */
    
    const configNameInput = document.getElementById('config-name-input');
    const btnSaveConfig = document.querySelector('.btn-save-config');
    const configListContainer = document.getElementById('config-list');
    const btnClearAllConfigs = document.querySelector('.btn-clear-all');

    // 渲染配置列表
    function renderConfigList() {
        if (!configListContainer) return;
        configListContainer.innerHTML = '';

        let configs = [];
        try {
            const saved = localStorage.getItem('api_configs');
            if (saved) {
                configs = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load configs', e);
        }

        if (configs.length === 0) {
            configListContainer.innerHTML = '<div class="no-config">暂无配置</div>';
            return;
        }

        configs.forEach((config, index) => {
            const item = document.createElement('div');
            item.className = 'config-item';
            
            // 点击整体加载配置
            item.addEventListener('click', (e) => {
                // 如果点击的是删除按钮，不加载
                if (e.target.classList.contains('btn-delete-config')) return;
                loadConfig(config);
            });

            // 状态样式
            const isQuotaOk = config.quotaStatus === '有额度';
            const statusClass = isQuotaOk ? 'status-ok' : 'status-no';

            item.innerHTML = `
                <div class="config-item-header">
                    <span class="config-name">${config.name}</span>
                    <span class="config-status-tag ${statusClass}">${config.quotaStatus}</span>
                    <span class="btn-delete-config" data-id="${config.id}">删除</span>
                </div>
                <div class="config-details">
                    <div class="config-detail-line">地址: ${config.apiAddress}</div>
                    <div class="config-detail-line">模型: ${config.model || '未选择'}</div>
                </div>
            `;

            // 删除事件绑定
            const deleteBtn = item.querySelector('.btn-delete-config');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`确定删除配置"${config.name}"吗？`)) {
                    deleteConfig(config.id);
                }
            });

            configListContainer.appendChild(item);
        });
    }

    // 保存新配置 (支持更新同名配置)
    function saveNewConfig() {
        const name = configNameInput.value.trim();
        const apiAddress = apiAddressInput.value.trim();
        const apiKey = apiKeyInput.value.trim();
        const model = modelSelectTrigger.dataset.value || '';
        
        let quotaStatus = '有额度';
        const activeQuotaBtn = document.querySelector('.quota-btn.active');
        if (activeQuotaBtn) {
            quotaStatus = activeQuotaBtn.textContent.trim();
        }

        if (!apiAddress) {
            if (typeof showToast === 'function') {
                showToast('请至少填写 API 地址');
            } else {
                alert('请至少填写 API 地址');
            }
            return;
        }

        const finalName = name || `配置 ${new Date().toLocaleTimeString()}`;

        let configs = [];
        try {
            const saved = localStorage.getItem('api_configs');
            if (saved) {
                configs = JSON.parse(saved);
            }
        } catch (e) {}

        // 检查是否存在同名配置
        const existingIndex = configs.findIndex(c => c.name === finalName);

        if (existingIndex !== -1) {
            // 更新现有配置
            configs[existingIndex] = {
                ...configs[existingIndex], // 保持原有 ID
                apiAddress,
                apiKey,
                model,
                quotaStatus,
                updatedAt: Date.now() // 可选：记录更新时间
            };
            showToast(`配置 "${finalName}" 已更新`);
            
        } else {
            // 创建新配置
            const newConfig = {
                id: Date.now().toString(),
                name: finalName,
                apiAddress,
                apiKey,
                model,
                quotaStatus
            };
            // 新配置插在最前面
            configs.unshift(newConfig);
            showToast('新配置已添加');
        }

        localStorage.setItem('api_configs', JSON.stringify(configs));
        
        // 清空名称输入框
        configNameInput.value = '';
        renderConfigList();
    }

    // 加载配置
    function loadConfig(config) {
        apiAddressInput.value = config.apiAddress || '';
        apiKeyInput.value = config.apiKey || '';
        
        if (config.model) {
            modelSelectTrigger.textContent = config.model;
            modelSelectTrigger.classList.add('has-value');
            modelSelectTrigger.dataset.value = config.model;
        } else {
            modelSelectTrigger.textContent = '未选择模型';
            modelSelectTrigger.classList.remove('has-value');
            delete modelSelectTrigger.dataset.value;
        }

        // 恢复状态按钮
        quotaBtns.forEach(btn => {
            if (btn.textContent.trim() === config.quotaStatus) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // 自动保存为当前生效设置
        saveSettings();
        
        // 显示 Toast
        showToast(`已加载: ${config.name}`);
    }

    // 动态显示 Toast 提示
    function showToast(message) {
        let toast = document.getElementById('dynamic-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'dynamic-toast';
            // 添加内联样式或确保 css 中有对应样式 (这里简单添加内联样式确保即刻可用)
            Object.assign(toast.style, {
                position: 'fixed',
                bottom: '100px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '20px',
                fontSize: '14px',
                zIndex: '2000',
                opacity: '0',
                transition: 'opacity 0.3s',
                pointerEvents: 'none' // 避免遮挡点击
            });
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        // 强制重绘
        toast.offsetHeight; 
        
        toast.style.opacity = '1';
        
        // 清除旧的 timer
        if (toast.timer) clearTimeout(toast.timer);
        
        toast.timer = setTimeout(() => {
            toast.style.opacity = '0';
        }, 2000);
    }

    // 删除配置
    function deleteConfig(id) {
        let configs = [];
        try {
            const saved = localStorage.getItem('api_configs');
            if (saved) {
                configs = JSON.parse(saved);
            }
        } catch (e) {}

        configs = configs.filter(c => c.id !== id);
        localStorage.setItem('api_configs', JSON.stringify(configs));
        renderConfigList();
    }

    // 清空全部
    function clearAllConfigs() {
        if (confirm('确定要清空所有已保存的配置吗？此操作不可恢复。')) {
            localStorage.removeItem('api_configs');
            renderConfigList();
        }
    }

    // 绑定事件
    if (btnSaveConfig) {
        btnSaveConfig.addEventListener('click', saveNewConfig);
    }

    if (btnClearAllConfigs) {
        btnClearAllConfigs.addEventListener('click', clearAllConfigs);
    }

    // 初始化显示列表
    renderConfigList();
}
