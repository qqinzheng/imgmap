var LOCAL = 'lsmainImgMap';

// ImageMapClass 构造函数
function ImageMapClass(target, options) {
    this.target = $(target);
    this.options = $.extend({}, ImageMapClass.defaultOptions, options);
    this.init();
}


ImageMapClass.defaultOptions = {
    target: null,
    atag: false // 
};

ImageMapClass.prototype.init = function () {
    var mapId = this.target.attr('usemap');
    var $map = null;
    if (this.options.atag) {
        $map = $('.map[name=' + mapId.replace('#', '') + ']');
        this.initImgNotMap($map);
    } else {
        $map = $('map[name=' + mapId.replace('#', '') + ']');
    }

    this.map = $map;

    this.syncMap();

    $(this.target).attr('data-usemap', '');
}

// 初始化图片的位置,默认放置在map标签内部
ImageMapClass.prototype.initImgNotMap = function ($map) {
    $map[0].insertBefore(this.target[0], null);
    $map.css({ position: 'relative' });
}

// 初始化map标签的解析过程

ImageMapClass.prototype.syncMap = function () {
    var $area = null;
    var self = this;
    if (this.options.atag) {
        $area = this.map.find('.area');
        $area.each(function (index, item) {
            self.syncArea(item);
        })
    } else {
        $area = this.map.find('map');
    }
}

// 同步a标签的位置信息
ImageMapClass.prototype.syncArea = function (area) {
    var shape = $(area).attr('shape');
    switch (shape) {
        case 'rect': this.syncRect(area);
            break;
        case 'circle': this.syncCircle(area);
            break;
        default:
            break;
    }
}


// 同步shape为rect的a标签的位置

ImageMapClass.prototype.syncRect = function (area) {
    var coords = this.parse(area); // 解析出了点的坐标
    var originWidth = this.options.clientwidth;
    var originHeight = this.options.clientheight;
    var nowWidth = this.target[0].clientWidth;
    var nowHeight = this.target[0].clientHeight;
    var nor = nowWidth / originWidth; // 公式 coords.lx / originWidth = csslx/ nowWidth , csslx = coords.lx * nowWidth/originWidth;
    var csslx = Math.round(coords.lx * nor);
    var cssly = Math.round(coords.ly * nor);
    var cssrx = Math.round(coords.rx * nor);
    var cssry = Math.round(coords.ry * nor);
    var offsetParent = this.map.offset(); // 以docuement,作统一度量衡
    var offset = $(this.target).offset();
    $(area).css({
        position: 'absolute',
        left: csslx + offset.left - offsetParent.left,
        top: cssly + offset.top - offsetParent.top,
        width: cssrx - csslx,
        height: cssry - cssly
    });
}

// 同步shape为circle的a标签位置信息(其实可以用rect代替,因为圆形理论上在css框模型中不存在)

ImageMapClass.prototype.syncCircle = function (area) {
    var coords = this.parse(area);
    var originHeight = this.options.clientheight;
    var originWidth = this.options.clientwidth;
    var nowWidth = this.target[0].clientWidth;
    var nowHeight = this.target[0].clientHeight;
    var cssx = Math.round(coords.x * (nowWidth / originWidth));
    var cssy = Math.round(coords.y * (nowHeight / originHeight));
    var cssr = Math.round(coords.r * (nowHeight / originHeight));
    $(area).css({
        position: 'absolute',
        left: cssx,
        top: cssy,
        width: cssr,
        height: cssr,
        borderRadius: '50%'
    });
}


// 对元素的coords进行解析

ImageMapClass.prototype.parse = function (area) {
    var $area = $(area);
    var coords = $area.attr('coords');
    var coordsArr = coords.split(',');
    if (coordsArr.length == 3) {
        return {
            x: Number(coordsArr[0]),
            y: Number(coordsArr[1]),
            r: Number(coordsArr[2])
        }
    } else if (coordsArr.length === 4) {
        return {
            lx: Number(coordsArr[0]),
            ly: Number(coordsArr[1]),
            rx: Number(coordsArr[2]),
            ry: Number(coordsArr[3])
        }
    }
}


$.fn.imgMap = function (options) {
    this.each(function () {
        var target = $(this);
        var data = this.dataset;
        var ins = data[LOCAL];

        // 实例化插件
        if (!ins) {
            ins = new ImageMapClass(this, data);
            this.dataset[LOCAL] = ins;
        }
    });
}

$(function () {
    function syncMap() {
        var ins = this.dataset[LOCAL];
        if (ins) {
            ins.syncMap();
        }
    }
    $(window).resize(function () {
        $("[data-usemap]").each(syncMap);
    });
    $('[data-plugin="imgMap"]').imgMap();
})