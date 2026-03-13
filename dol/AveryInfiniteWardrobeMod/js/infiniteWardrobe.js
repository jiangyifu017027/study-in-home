/**
 * 艾弗里豪宅无限衣柜 Mod
 * 当玩家入住艾弗里豪宅后，衣柜容量变为无限
 */

(function() {
    'use strict';

    // 等待游戏加载完成
    $(document).on(':storyready', function() {
        console.log('[无限衣柜Mod] 已加载');
    });

    /**
     * 检查玩家是否住在艾弗里豪宅
     * 检测多个可能的变量，以确保兼容性
     */
    function isPlayerAtAveryMansion() {
        // 获取 SugarCube 状态变量
        var vars = State.variables;
        
        // 检查多种可能的变量命名方式
        // 方式1：直接检查当前地点
        var currentPassage = State.passage;
        var locationName = vars.location || vars.passage || '';
        
        // 方式2：检查艾弗里相关的豪宅变量
        var averyCondo = false;
        if (vars.avery) {
            averyCondo = vars.avery.condo || vars.avery.mansion || vars.avery.penthouse || false;
        }
        
        // 方式3：检查居住地点
        var livingLocation = vars.livingLocation || vars.home || vars.residence || '';
        
        // 方式4：检查是否在豪宅的各个房间
        var mansionPassages = [
            'Averys Mansion', 'Avery Mansion', 'Avery Condo', 'Averys Condo',
            'Mansion Bedroom', 'Mansion Lounge', 'Mansion Study', 
            'Mansion Dining Room', 'Mansion Kitchen', 'Mansion Bathroom',
            'Mansion Garage', 'Mansion Garden', 'Mansion Wardrobe'
        ];
        
        var isInMansionPassage = false;
        if (currentPassage) {
            var passageName = typeof currentPassage === 'string' ? currentPassage : currentPassage.name;
            for (var i = 0; i < mansionPassages.length; i++) {
                if (passageName && passageName.toLowerCase().includes(mansionPassages[i].toLowerCase())) {
                    isInMansionPassage = true;
                    break;
                }
            }
        }
        
        // 检查字符串中是否包含艾弗里豪宅的关键词
        var locationStr = String(locationName).toLowerCase();
        var livingStr = String(livingLocation).toLowerCase();
        var isAveryLocation = locationStr.includes('avery') || locationStr.includes('mansion') || locationStr.includes('condo');
        var isAveryLiving = livingStr.includes('avery') || livingStr.includes('mansion') || livingStr.includes('condo');
        
        // 返回综合判断结果
        return averyCondo || isInMansionPassage || isAveryLocation || isAveryLiving;
    }

    /**
     * 获取修改后的衣柜容量
     * 如果在艾弗里豪宅，返回无限大（999999）
     * 否则返回原来的值
     */
    function getModifiedWardrobeSpace(originalSpace) {
        if (isPlayerAtAveryMansion()) {
            return 999999; // 在艾弗里豪宅时，容量几乎无限
        }
        return originalSpace;
    }

    /**
     * 修改衣柜系统的空间检查
     * 通过覆盖 setup 中的相关函数来实现
     */
    function patchWardrobeSystem() {
        // 确保 setup 对象存在
        if (!window.setup) {
            window.setup = {};
        }
        
        // 保存原始的衣柜空间函数（如果存在）
        var originalGetWardrobeSpace = setup.getWardrobeSpace;
        
        /**
         * 获取当前衣柜容量限制
         * 如果玩家在艾弗里豪宅，返回无限
         */
        setup.getWardrobeSpace = function() {
            var baseSpace = 20; // 默认基础容量
            
            // 如果游戏有设置变量，使用游戏的设置
            if (State.variables.wardrobe && State.variables.wardrobe.space) {
                baseSpace = State.variables.wardrobe.space;
            }
            
            // 应用修改
            return getModifiedWardrobeSpace(baseSpace);
        };
        
        /**
         * 检查衣柜是否已满
         * 如果在艾弗里豪宅，永远返回 false（未满）
         */
        setup.isWardrobeFull = function(slot) {
            if (isPlayerAtAveryMansion()) {
                return false; // 在艾弗里豪宅，衣柜永远不满
            }
            
            // 否则使用原始逻辑
            var wardrobe = State.variables.wardrobe;
            if (!wardrobe || !wardrobe[slot]) {
                return false;
            }
            
            var space = wardrobe.space || 20;
            return wardrobe[slot].length >= space;
        };
        
        /**
         * 获取指定槽位的剩余空间
         */
        setup.getWardrobeRemainingSpace = function(slot) {
            if (isPlayerAtAveryMansion()) {
                return 999999; // 几乎无限
            }
            
            var wardrobe = State.variables.wardrobe;
            if (!wardrobe || !wardrobe[slot]) {
                return 0;
            }
            
            var space = wardrobe.space || 20;
            return Math.max(0, space - wardrobe[slot].length);
        };
        
        console.log('[无限衣柜Mod] 衣柜系统已修改');
    }

    /**
     * 在 passage 渲染时应用修改
     */
    $(document).on(':passagestart', function(ev) {
        var passageName = ev.passage ? ev.passage.name : '';
        
        // 如果进入衣柜相关的 passage，应用修改
        if (passageName && (
            passageName.toLowerCase().includes('wardrobe') ||
            passageName.toLowerCase().includes('closet') ||
            passageName.toLowerCase().includes('clothing')
        )) {
            // 在艾弗里豪宅时，临时修改 wardrobe.space
            if (isPlayerAtAveryMansion()) {
                var vars = State.variables;
                if (vars.wardrobe) {
                    // 保存原始值
                    if (!vars.wardrobe._originalSpace) {
                        vars.wardrobe._originalSpace = vars.wardrobe.space;
                    }
                    // 设置为无限
                    vars.wardrobe.space = 999999;
                    console.log('[无限衣柜Mod] 已在艾弗里豪宅激活无限衣柜');
                }
            }
        }
    });

    $(document).on(':passageend', function(ev) {
        var passageName = ev.passage ? ev.passage.name : '';
        
        // 离开衣柜时恢复原始值
        if (passageName && (
            passageName.toLowerCase().includes('wardrobe') ||
            passageName.toLowerCase().includes('closet')
        )) {
            var vars = State.variables;
            if (vars.wardrobe && vars.wardrobe._originalSpace !== undefined) {
                // 只有在离开艾弗里豪宅区域时才恢复
                if (!isPlayerAtAveryMansion()) {
                    vars.wardrobe.space = vars.wardrobe._originalSpace;
                    console.log('[无限衣柜Mod] 已恢复原始衣柜容量');
                }
            }
        }
    });

    // 立即尝试修改系统
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', patchWardrobeSystem);
    } else {
        patchWardrobeSystem();
    }

    // 同时监听 SugarCube 就绪事件
    $(document).on(':storyready', patchWardrobeSystem);

})();
