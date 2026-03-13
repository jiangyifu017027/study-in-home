// 无限衣柜 Mod v3.1 - 调试版
(function() {
    'use strict';
    
    console.log('[无限衣柜Mod] ========== 开始加载 ==========');
    
    var INFINITE = 99999;
    var checkCount = 0;
    
    // 核心函数：设置无限容量
    function setInfiniteWardrobe() {
        try {
            // 检查 State 是否存在
            if (typeof State === 'undefined') {
                console.log('[无限衣柜Mod] State 未定义');
                return false;
            }
            
            // 检查 variables 是否存在
            if (!State.variables) {
                console.log('[无限衣柜Mod] State.variables 未定义');
                return false;
            }
            
            // 检查 wardrobe 是否存在
            var wardrobe = State.variables.wardrobe;
            if (!wardrobe) {
                console.log('[无限衣柜Mod] wardrobe 未定义');
                return false;
            }
            
            // 检查当前容量
            var currentSpace = wardrobe.space;
            checkCount++;
            
            // 如果已经是无限，不重复设置
            if (currentSpace === INFINITE) {
                if (checkCount % 10 === 0) {
                    console.log('[无限衣柜Mod] 检查 #' + checkCount + ': 已经是无限容量');
                }
                return true;
            }
            
            // 设置为无限
            wardrobe.space = INFINITE;
            
            // 验证设置是否成功
            if (wardrobe.space === INFINITE) {
                console.log('[无限衣柜Mod] ✅ 成功设置容量为:', INFINITE, '(原容量:', currentSpace + ')');
                return true;
            } else {
                console.log('[无限衣柜Mod] ❌ 设置失败，当前容量:', wardrobe.space);
                return false;
            }
            
        } catch (e) {
            console.error('[无限衣柜Mod] 错误:', e.message);
            return false;
        }
    }
    
    // 启动函数
    function startMod() {
        console.log('[无限衣柜Mod] 正在启动...');
        
        // 立即执行一次
        var result = setInfiniteWardrobe();
        
        if (result) {
            console.log('[无限衣柜Mod] 启动成功！');
        } else {
            console.log('[无限衣柜Mod] 启动时未找到 wardrobe，将持续尝试...');
        }
        
        // 每 200ms 检查一次
        setInterval(function() {
            setInfiniteWardrobe();
        }, 200);
    }
    
    // 等待 SugarCube 加载完成
    function waitForSugarCube() {
        if (typeof SugarCube !== 'undefined' && SugarCube.State) {
            console.log('[无限衣柜Mod] SugarCube 已就绪');
            startMod();
        } else {
            setTimeout(waitForSugarCube, 100);
        }
    }
    
    // 方式1：立即开始等待
    waitForSugarCube();
    
    // 方式2：DOM 就绪后
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[无限衣柜Mod] DOM 已就绪');
            startMod();
        });
    } else {
        startMod();
    }
    
    // 方式3：监听 passage 变化
    if (typeof jQuery !== 'undefined') {
        jQuery(document).on(':passagestart', function() {
            setInfiniteWardrobe();
        });
        
        jQuery(document).on(':passagedisplay', function() {
            setInfiniteWardrobe();
        });
    }
    
    // 方式4：定时检查 SugarCube
    var checkInterval = setInterval(function() {
        if (typeof SugarCube !== 'undefined' && SugarCube.State && SugarCube.State.variables && SugarCube.State.variables.wardrobe) {
            SugarCube.State.variables.wardrobe.space = INFINITE;
        }
    }, 100);
    
    // 60秒后停止定时检查
    setTimeout(function() {
        clearInterval(checkInterval);
    }, 60000);
    
    // 暴露全局函数供手动调用
    window.fixWardrobe = function() {
        var result = setInfiniteWardrobe();
        if (result) {
            console.log('[无限衣柜Mod] 手动修复成功！当前容量:', State.variables.wardrobe.space);
        } else {
            console.log('[无限衣柜Mod] 手动修复失败');
        }
    };
    
    console.log('[无限衣柜Mod] ========== 加载脚本结束 ==========');
    console.log('[无限衣柜Mod] 提示：如果容量未改变，请在控制台输入 fixWardrobe() 手动修复');
})();
