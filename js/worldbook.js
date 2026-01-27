import { switchPage } from './router.js';

export function initWorldBook() {
    // ★ 加在最上面，用来记住当前正在看哪本书
    let currentBookName = ''; 

    // 1. 路由跳转逻辑
    const btnBack = document.getElementById('btn-back-worldbook');
    if (btnBack) btnBack.addEventListener('click', () => switchPage('page-home'));

    const btnGlobal = document.getElementById('btn-wb-global');
    if (btnGlobal) btnGlobal.addEventListener('click', () => switchPage('page-worldbook-global'));

    const btnBackGlobal = document.getElementById('btn-back-wb-global');
    if (btnBackGlobal) btnBackGlobal.addEventListener('click', () => switchPage('page-worldbook'));

       // 条目页面的返回逻辑
    const btnBackEntry = document.getElementById('btn-back-wb-entry');
    if (btnBackEntry) btnBackEntry.addEventListener('click', () => switchPage('page-worldbook-global'));


    // 2. 弹窗与列表逻辑
    const btnNewWb = document.getElementById('btn-new-wb');
    const modal = document.getElementById('modal-new-wb');
    const btnCancel = document.getElementById('btn-cancel-wb');
    const btnConfirm = document.getElementById('btn-confirm-wb');
    const inputName = document.getElementById('input-wb-name');
    const listContainer = document.getElementById('wb-list');
    const modalTitle = modal.querySelector('.modal-title');

    let currentEditingItem = null;

    // ★ 新增：保存世界书列表到本地
    function saveWorldBooks() {
        const books = [];
        const items = listContainer.querySelectorAll('.wb-item');
        items.forEach(item => {
            books.push(item.querySelector('.wb-name').textContent);
        });
        localStorage.setItem('my_worldbooks_list', JSON.stringify(books));
    }

    // ★ 新增：加载世界书列表
    function loadWorldBooks() {
        const saved = localStorage.getItem('my_worldbooks_list');
        if (saved) {
            const books = JSON.parse(saved);
            listContainer.innerHTML = ''; // 清空现有
            books.forEach(name => addWorldBookItem(name, false)); // false代表加载模式，不重复保存
        }
    }

    const openModal = (item = null) => {
        currentEditingItem = item;
        modal.classList.add('active');
        if (item) {
            modalTitle.textContent = "重命名世界书";
            inputName.value = item.querySelector('.wb-name').textContent;
        } else {
            modalTitle.textContent = "新建世界书";
            inputName.value = '';
        }
        inputName.focus();
    };

    const closeModal = () => {
        modal.classList.remove('active');
        currentEditingItem = null;
    };

    if (btnNewWb) btnNewWb.addEventListener('click', () => openModal(null));
    if (btnCancel) btnCancel.addEventListener('click', closeModal);

    // 确认按钮逻辑
    if (btnConfirm) {
        btnConfirm.addEventListener('click', () => {
            const name = inputName.value.trim();
            if (!name) return; // 名字为空不处理

            if (currentEditingItem) {
                // === 修改逻辑 ===
                
                // 1. 先获取旧名字（搬家前的地址）
                const oldName = currentEditingItem.querySelector('.wb-name').textContent;
                
                // 2. 更新界面上的名字
                currentEditingItem.querySelector('.wb-name').textContent = name;
                
                // ★ 3. 搬家！把旧名字下的数据，移动到新名字下
                if (oldName !== name) {
                    const oldData = localStorage.getItem('wb_data_' + oldName);
                    if (oldData) {
                        localStorage.setItem('wb_data_' + name, oldData); // 存到新家
                        localStorage.removeItem('wb_data_' + oldName);    // 拆掉旧家
                    }
                }
                
                saveWorldBooks(); // 保存列表
            } else {
                // === 新建逻辑 ===
                addWorldBookItem(name);
            }
            closeModal();
        });
    }

    // 添加列表项函数 (增加 save 参数，默认 true)
    function addWorldBookItem(name, shouldSave = true) {
        const item = document.createElement('div');
        item.className = 'wb-item';
        item.innerHTML = `
            <span class="wb-name">${name}</span>
            <div class="wb-actions">
                <button class="wb-action-btn btn-rename">重命名</button>
                <button class="wb-action-btn btn-delete">删除</button>
            </div>
        `;

        const btnRename = item.querySelector('.btn-rename');
        btnRename.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(item);
        });

        const btnDelete = item.querySelector('.btn-delete');
        btnDelete.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // ★ 1. 拿到书名
            const nameToDelete = item.querySelector('.wb-name').textContent;
            
            // ★ 2. 删掉它的所有数据
            localStorage.removeItem('wb_data_' + nameToDelete);
            
            // 3. 删掉列表项并保存
            item.remove();
            saveWorldBooks(); 
        });

        // 条目点击事件
        item.addEventListener('click', () => {
            // 1. 获取当前书名
            const name = item.querySelector('.wb-name').textContent;
            currentBookName = name; // ★ 记住它！
            
            // 2. 修改标题
            const titleEl = document.getElementById('wb-entry-title');
            if (titleEl) titleEl.textContent = name;
            
            // ★ 3. 进门前先清空列表，并加载这本书专属的内容
            document.getElementById('wb-entry-list').innerHTML = ''; 
            loadAllEntries(); 

            // 4. 跳转页面
            switchPage('page-worldbook-entry');
        });
        listContainer.appendChild(item);
        
        // ★ 如果是新建操作，就保存一次；如果是读取操作，就不保存（避免死循环）
        if (shouldSave) {
            saveWorldBooks();
        }
    }

    // ★ 初始化时读取列表
    loadWorldBooks();

    // --- 编辑页逻辑 ---
    
    // 1. 跳转逻辑：从列表点进去
    // 暂时先写返回逻辑
    const btnBackEdit = document.getElementById('btn-back-wb-edit');
    if (btnBackEdit) {
        btnBackEdit.addEventListener('click', () => {
            // 返回到列表页（这里假设列表页ID是 page-worldbook-entry，如果不是你自己改一下）
            // 实际上你之前的代码里列表是在 page-worldbook-entry
            switchPage('page-worldbook-entry'); 
        });
    }

    // 2. 策略改变时，显示/隐藏深度输入框
    const selectStrategy = document.getElementById('wb-select-strategy');
    const groupDepth = document.getElementById('group-wb-depth');
    
    if (selectStrategy && groupDepth) {
        selectStrategy.addEventListener('change', (e) => {
            if (e.target.value === 'depth') {
                groupDepth.style.display = 'flex';
            } else {
                groupDepth.style.display = 'none';
            }
        });
    }

    // 3. 简单的词符计算 (这里简单按字数算，你可以以后换成 tokenizer)
    const inputContent = document.getElementById('wb-input-content');
    const tokenNumDisplay = document.getElementById('wb-token-num');
    
    if (inputContent && tokenNumDisplay) {
        inputContent.addEventListener('input', () => {
            tokenNumDisplay.textContent = inputContent.value.length;
        });
    }
    
    // 4. 保存按钮 - 具体逻辑在下方实现，保留占位注释

// ... (前面的代码) ...

    // --- 条目列表页逻辑 ---

    // ★ 1. 在这里加一个变量，用来记录当前正在编辑的是哪个条目（如果是新建就是 null）
    let currentEditingEntryId = null; 

    // 点击“新建”按钮
    const btnNewEntryContent = document.getElementById('btn-new-entry-content');
    if (btnNewEntryContent) {
        btnNewEntryContent.addEventListener('click', () => {
            // 清空输入框
            document.getElementById('wb-input-title').value = '';
            document.getElementById('wb-input-keys').value = '';
            document.getElementById('wb-input-content').value = '';
            
            // ★ 标记为新建模式
            currentEditingEntryId = null;
            
            switchPage('page-worldbook-edit');
        });
    }

    // ★ 2. 核心：保存按钮逻辑
    const btnSaveWb = document.getElementById('btn-save-wb');
    const entryListContainer = document.getElementById('wb-entry-list');

    if (btnSaveWb) {
        btnSaveWb.addEventListener('click', () => {
            // 1. 获取输入内容
            const title = document.getElementById('wb-input-title').value.trim() || '未命名条目';
            const keys = document.getElementById('wb-input-keys').value;
            const content = document.getElementById('wb-input-content').value;
            
            // ★【修复点1】获取“状态”下拉框
            const statusSelect = document.getElementById('wb-select-status');
            const statusValue = statusSelect ? statusSelect.value : 'permanent'; 

            // 获取“插入位置”策略
            const strategySelect = document.getElementById('wb-select-strategy');
            const strategy = strategySelect ? strategySelect.value : 'depth'; 

            // ★【修复点2】判断是否绿灯
            const isKeyword = (statusValue === 'keyword');

            if (currentEditingEntryId) {
                // === 修改旧条目 ===
                const existingItem = document.getElementById(currentEditingEntryId);
                if (existingItem) {
                    existingItem.querySelector('.entry-title').textContent = title;
                    
                    const dot = existingItem.querySelector('.status-dot');
                    if (isKeyword) dot.classList.add('type-keyword');
                    else dot.classList.remove('type-keyword');

                    existingItem.dataset.keys = keys;
                    existingItem.dataset.content = content;
                    existingItem.dataset.strategy = strategy;
                    existingItem.dataset.status = statusValue;
                }
            } else {
                // === 新建新条目 ===
                const newId = 'entry-' + Date.now();
                const item = document.createElement('div');
                item.className = 'entry-item';
                item.id = newId;
                
                item.dataset.keys = keys;
                item.dataset.content = content;
                item.dataset.strategy = strategy;
                item.dataset.status = statusValue;

                const dotClass = isKeyword ? 'status-dot type-keyword' : 'status-dot';

                item.innerHTML = `
                    <div class="entry-left">
                        <div class="capsule-switch active"></div>
                        <div class="${dotClass}"></div>
                        <div class="entry-title">${title}</div>
                    </div>
                    <div class="entry-actions">
                        <button class="entry-btn btn-edit-entry">编辑</button>
                        <button class="entry-btn btn-del-entry">删除</button>
                    </div>
                `;

                // --- 绑定事件 ---
                const switchBtn = item.querySelector('.capsule-switch');
                switchBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    switchBtn.classList.toggle('active');
                    saveAllEntries(); // ★ 开关也要保存
                });

                item.querySelector('.btn-del-entry').addEventListener('click', (e) => {
                    e.stopPropagation();
                    item.remove();
                    saveAllEntries(); // ★ 删除也要保存
                });

                item.querySelector('.btn-edit-entry').addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    document.getElementById('wb-input-title').value = item.querySelector('.entry-title').textContent;
                    document.getElementById('wb-input-keys').value = item.dataset.keys || '';
                    document.getElementById('wb-input-content').value = item.dataset.content || '';
                    
                    if (statusSelect) statusSelect.value = item.dataset.status || 'permanent';

                    if (strategySelect) {
                        strategySelect.value = item.dataset.strategy || 'depth';
                        strategySelect.dispatchEvent(new Event('change'));
                    }

                    currentEditingEntryId = newId;
                    switchPage('page-worldbook-edit');
                });

                if (entryListContainer) entryListContainer.appendChild(item);
            }

            // ★★★ 重点在这里！这一句必须在花括号里面！ ★★★
            saveAllEntries(); 
            
            switchPage('page-worldbook-entry');
        });
    }

        // ============================
    // ★ 新增：自动存档/读档功能
    // ============================

    // 1. 定义一个“渲染条目”的函数（用来恢复显示）
    function renderEntryElement(data) {
        const item = document.createElement('div');
        item.className = 'entry-item';
        item.id = data.id;
        
        // 恢复数据
        item.dataset.keys = data.keys;
        item.dataset.content = data.content;
        item.dataset.strategy = data.strategy;
        item.dataset.status = data.status;

        const isKeyword = (data.status === 'keyword');
        const dotClass = isKeyword ? 'status-dot type-keyword' : 'status-dot';
        const switchClass = data.isActive ? 'capsule-switch active' : 'capsule-switch';

        item.innerHTML = `
            <div class="entry-left">
                <div class="${switchClass}"></div>
                <div class="${dotClass}"></div>
                <div class="entry-title">${data.title}</div>
            </div>
            <div class="entry-actions">
                <button class="entry-btn btn-edit-entry">编辑</button>
                <button class="entry-btn btn-del-entry">删除</button>
            </div>
        `;

        // 重新绑定事件（和之前一样）
        const switchBtn = item.querySelector('.capsule-switch');
        switchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            switchBtn.classList.toggle('active');
            saveAllEntries(); // ★ 开关也要保存
        });

        item.querySelector('.btn-del-entry').addEventListener('click', (e) => {
            e.stopPropagation();
            item.remove();
            saveAllEntries(); // ★ 删除也要保存
        });

        item.querySelector('.btn-edit-entry').addEventListener('click', (e) => {
            e.stopPropagation();
            // 回填数据逻辑...
            document.getElementById('wb-input-title').value = item.querySelector('.entry-title').textContent;
            document.getElementById('wb-input-keys').value = item.dataset.keys || '';
            document.getElementById('wb-input-content').value = item.dataset.content || '';
            
            const statusSelect = document.getElementById('wb-select-status');
            if (statusSelect) statusSelect.value = item.dataset.status || 'permanent';

            const strategySelect = document.getElementById('wb-select-strategy');
            if (strategySelect) {
                strategySelect.value = item.dataset.strategy || 'depth';
                strategySelect.dispatchEvent(new Event('change'));
            }

            currentEditingEntryId = data.id;
            switchPage('page-worldbook-edit');
        });

        document.getElementById('wb-entry-list').appendChild(item);
    }

    // 2. 定义“保存所有条目”的函数
    function saveAllEntries() {
        // ★ 如果没有书名，就不存（防止报错）
        if (!currentBookName) return;

        const entries = [];
        const list = document.getElementById('wb-entry-list');
        if (!list) return;

        list.querySelectorAll('.entry-item').forEach(item => {
            entries.push({
                id: item.id,
                title: item.querySelector('.entry-title').textContent,
                keys: item.dataset.keys,
                content: item.dataset.content,
                strategy: item.dataset.strategy,
                status: item.dataset.status,
                isActive: item.querySelector('.capsule-switch').classList.contains('active')
            });
        });
        
        // ★ 关键：用书名做区分！
        localStorage.setItem('wb_data_' + currentBookName, JSON.stringify(entries));
    }

    // 3. 定义“加载所有条目”的函数
    function loadAllEntries() {
        // ★ 如果没有书名，就不读
        if (!currentBookName) return;

        // ★ 关键：读取对应书名的数据
        const savedData = localStorage.getItem('wb_data_' + currentBookName);
        
        const list = document.getElementById('wb-entry-list');
        if(list) list.innerHTML = ''; // 先清空

        if (savedData) {
            const entries = JSON.parse(savedData);
            entries.forEach(data => {
                renderEntryElement(data);
            });
        }
    }

}
