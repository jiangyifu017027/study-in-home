/**
 * 无限衣柜 Mod - 全地点版
 * 将所有衣柜容量扩展为 99999
 */

(function() {
    'use strict';

    console.log('[无限衣柜Mod] 正在加载...');

    // 目标容量
    var INFINITE_SPACE = 99999;

    /**
     * 设置无限衣柜容量
     */
    function setInfiniteSpace() {
        try {
            var vars = State.variables;
            if (vars.wardrobe) {
                // 保存原始值（仅保存一次）
                if (vars.wardrobe._originalSpace === undefined && vars.wardrobe.space !== undefined) {
                    vars.wardrobe._originalSpace = vars.wardrobe.space;
                    console.log('[无限衣柜Mod] 已保存原始容量:', vars.wardrobe._originalSpace);
                }
                // 设置为无限
                vars.wardrobe.space = INFINITE_SPACE;
            }
        } catch (e) {
            console.error('[无限衣柜Mod] 设置容量失败:', e);
        }
    }

    /**
     * 重写衣柜相关函数
     */
    function patchWardrobeFunctions() {
        if (!window.setup) {
            window.setup = {};
        }

        // 保存原始函数（如果存在）
        var _originalCheckWardrobeSpace = setup.checkWardrobeSpace;
        var _originalGetWardrobeSpace = setup.getWardrobeSpace;

        /**
         * 检查衣柜空间 - 永远返回有足够空间
         */
        setup.checkWardrobeSpace = function(slot, count) {
            return true;
        };

        /**
         * 获取衣柜容量 - 返回无限
         */
        setup.getWardrobeSpace = function() {
            return INFINITE_SPACE;
        };

        /**
         * 检查是否可以添加物品到衣柜
         */
        setup.canAddToWardrobe = function(slot, items) {
            return true;
        };

        console.log('[无限衣柜Mod] 函数已重写');
    }

    /**
     * 修改 SugarCube 的 State 变量
     */
    function hijackWardrobeState() {
        try {
            var vars = State.variables;
            if (!vars.wardrobe) {
                console.log('[无限衣柜Mod] wardrobe 变量不存在，等待创建...');
                return false;
            }

            // 使用 Object.defineProperty 拦截 space 属性
            var currentSpace = vars.wardrobe.space;
            
            Object.defineProperty(vars.wardrobe, 'space', {
                get: function() {
                    return INFINITE_SPACE;
                },
                set: function(value) {
                    // 允许设置，但 getter 永远返回无限
                    this._innerSpace = value;
                },
                configurable: true,
                enumerable: true
            });

            // 保存原始值
            vars.wardrobe._originalSpace = currentSpace;
            vars.wardrobe._innerSpace = currentSpace;

            console.log('[无限衣柜Mod] State 变量已拦截');
            return true;
        } catch (e) {
            console.error('[无限衣柜Mod] 拦截失败:', e);
            return false;
        }
    }

    /**
     * 强制修改所有衣柜相关的值
     */
    function forceInfiniteWardrobe() {
        try {
            var vars = State.variables;
            
            // 直接修改 wardrobe.space
            if (vars.wardrobe) {
                vars.wardrobe.space = INFINITE_SPACE;
                
                // 如果有 space_max 也修改
                if (vars.wardrobe.space_max !== undefined) {
                    vars.wardrobe.space_max = INFINITE_SPACE;
                }
                
                console.log('[无限衣柜Mod] 容量已设为:', vars.wardrobe.space);
            }

            // 修改全局 wardrobe 配置（如果存在）
            if (window.V && window.V.wardrobe) {
                window.V.wardrobe.space = INFINITE_SPACE;
            }

        } catch (e) {
            console.error('[无限衣柜Mod] 强制修改失败:', e);
        }
    }

    // ========== 事件监听 ==========

    // 游戏就绪时
    $(document).on(':storyready', function() {
        console.log('[无限衣柜Mod] 游戏就绪，正在激活...');
        patchWardrobeFunctions();
        
        // 尝试多种方式修改
        if (!hijackWardrobeState()) {
            setInfiniteSpace();
        }
        
        forceInfiniteWardrobe();
    });

    // 每次 passage 渲染前
    $(document).on(':passagestart', function() {
        forceInfiniteWardrobe();
    });

    // 每次 passage 渲染后
    $(document).on(':passagedisplay', function() {
        forceInfiniteWardrobe();
    });

    // 点击链接时
    $(document).on('click', 'a', function() {
        setTimeout(forceInfiniteWardrobe, 100);
    });

    // 定时检查（备用方案）
    setInterval(function() {
        forceInfiniteWardrobe();
    }, 1000);

    // 立即执行一次
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        patchWardrobeFunctions();
        setTimeout(forceInfiniteWardrobe, 500);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            patchWardrobeFunctions();
            setTimeout(forceInfiniteWardrobe, 500);
        });
    }

    console.log('[无限衣柜Mod] 加载完成 - 容量:', INFINITE_SPACE);

})();
