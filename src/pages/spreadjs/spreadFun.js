/* eslint-disable */
import GC from '@grapecity/spread-sheets';
let spreadNS = GC.Spread.Sheets

/**
 * 用于在对象数组中查询特定值或下标
 *
 * @param {any} value 要在查找的值
 * @param {*} arr 数组
 * @param {*} isReturnIndex 是否返回下标值
 */
let findFromArr =  (value,arr,isReturnIndex = false) => {
    let result = ''
    let index = -1
    for(let i = 0;i<arr.length;i++){
    let item = arr[i]
        if(item.nodeType == value){
            result = item.name
            index = i
        }
    }
    if(isReturnIndex){
        return index
    }else{
        return result
    }
}
//字符转译
function HTMLEncode(html) {
    let temp = document.createElement("div");
    (temp.textContent != null) ? (temp.textContent = html) : (temp.innerText = html);
    let output = temp.innerHTML;
    temp = null;
    return output;
}
//字符反转译
function HTMLDecode(text) {
    let temp = document.createElement("div");
    temp.innerHTML = text;
    let output = temp.innerText || temp.textContent;
    temp = null;
    return output;
}

/**
 * //字符截取
 * @param {*} c canvas画笔
 * @param {*} str 原本的字符
 * @param {*} len 原本的字符长度
 * @param {*} textMaxWidth 字符绘制区的宽度
 * @param {*} end 原始字符长度
 * @param {*} start 原始字符起始长度  0
 */
let strReduce = (c,str,len,maxWidth,end,start) => {
    maxWidth = maxWidth - 0.5
    len =  Math.ceil(len - (end - start)/2)
    let copyStr = (JSON.parse(JSON.stringify(str))).slice(0,len)
    //目前长度减一后截取的字符绘制长度
    let tmpMinWidth = c.measureText((JSON.parse(JSON.stringify(str))).slice(0,len-1)).width
    //目前字符的绘制长度
    let tmpWidth = c.measureText(copyStr).width
    //目前长度加一后截取的字符绘制长度
    let tmpMaxWidth = c.measureText((JSON.parse(JSON.stringify(str))).slice(0,len+1)).width
    //若减一后的绘制长度小于限定长度，加一后的绘制长度大于限定长度，且目前字符绘制长度小于限定长度或者等于限制长度;或者截至为止与目前的字符截取长度位一致即 end==len (若不加此判断因为是向上取整，在偶然的情况下会出现死循环)
    if((tmpMinWidth < maxWidth && tmpMaxWidth > maxWidth && (tmpWidth< maxWidth || tmpWidth == maxWidth))  || end == len){
        if(end == len){//极端情况下会出现end==len，但此时截取出的文字的绘制长度依然大于限定长度，则取当前截取位减一的文本作为绘制文本
            if(tmpWidth > maxWidth){
                copyStr = JSON.parse(JSON.stringify(str)).slice(0,len-1)
            }
        }
        return copyStr
    }else if(tmpMaxWidth == maxWidth){
        return (JSON.parse(JSON.stringify(str))).slice(0,len+1)
    }else if(tmpWidth > maxWidth){
        end = len
        return strReduce(c,str,len,maxWidth,end,start)
    }else if(tmpWidth < maxWidth){
        start = len
        return strAdd(c,str,len,maxWidth,end,start)
    }
}
/**
 * //字符增加
 * @param {*} c canvas画笔
 * @param {*} str 原本的字符
 * @param {*} len 原本的字符长度
 * @param {*} textMaxWidth 字符绘制区的宽度
 * @param {*} end 原始字符长度
 * @param {*} start 原始字符起始长度  0
 */
let strAdd = (c,str,len,maxWidth,end,start) => {
    len =  Math.ceil(len + (end - start)/2)
    let copyStr = (JSON.parse(JSON.stringify(str))).slice(0,len)
    let tmpWidth = c.measureText(copyStr).width
    if(tmpWidth > maxWidth){
        end = len
        return strReduce(c,str,len,maxWidth,end,start)
    }else if(tmpWidth < maxWidth){
        start = len
        return strAdd(c,str,len,maxWidth,end,start)
    }else if(tmpWidth == maxWidth){
        return copyStr
    }
}


/**
 * 用于过滤并形成最后需要省略显示的文字
 *
 * @param {*} c canvas画笔
 * @param {*} str 要显示的字符串
 * @param {*} maxWidth 最大宽度SingleHyperLinkCell
 */
let fittingString = (c, str, maxWidth) => {
    let obj = {newStr:'',isEllipsis:false}
    let width = c.measureText(str).width;
    let ellipsis = '…';
    let len = JSON.parse(JSON.stringify(str)).length;
    let start = 0;
    let end = JSON.parse(JSON.stringify(str)).length;
    let ellipsisWidth = c.measureText(ellipsis).width;
    if (width <= maxWidth || width <= ellipsisWidth) {
        obj = {newStr:str,isEllipsis:false}
        return obj;
    } else {
        let newStr = strReduce(c,str,len,maxWidth - ellipsisWidth,end,start)
        obj = {newStr:newStr + ellipsis,isEllipsis:true}
        return obj;
    }
}

/**
 * customCellType  用于spreadJS表格单元格显示层级，不同层级显示不同颜色,当文本宽度超出的时候nameKey所对应的字段会显示为...
 *
 * @param {Array} data 所要展示的的数据
 * @param {String} nameKey 工程分项后面所要跟随那个字段的值
 * @param {Array} colorRange 个层架显示颜色集合
 * @param {Array} nodeTypeNameEmun 工程划分枚举值
 * @param {Boolean} isAutoFitColumn 是否自适应撑开列宽
 * @param {String} nodeTypeKey 工程节点分级字段（非必传字段，不传时，取当前列的字段值作为工程节点分级字段，否则取当前字段作为工程节点分级字段）
 * @param {Boolean} isNeedTip 是否需要提示，默认值为true
 * @param {String} parentId  表格最外层容器Id position属性应为relative(注：isNeedTip 为 true 时必传)
 * @param {Array<String>} stringArr 提示所需要的字段集合，默认显示当前单元格nameKey所对应的字段值
 * @param {String} linkChart  提示内容多个字段的连接符，默认“-”
 * @param {Number} partSize 工程划分文字大小 默认14
 * @param {Number} nameSize 工程划分后的文字大小 默认14
 * @param {Number} zIndex toolTip显示层级，默认1700
 * @param {Number} lineHeight 单元格高度，默认48
 *
 */
export function customCellType(data,nameKey,colorRange,nodeTypeNameEmun,isAutoFitColumn,nodeTypeKey,isNeedTip,parentId,stringArr,linkChart,partSize,nameSize,zIndex,lineHeight,){
    const typeEmun = [
        { nodeType: 1, name: "单位工程" },
        { nodeType: 2, name: "子单位工程"},
        { nodeType: 3, name: "分部工程"},
        { nodeType: 4, name: "子分部工程"},
        { nodeType: 5, name: "实体单元"},
        { nodeType: 6, name: "分项工程"},
        // { nodeType: 7, name: "清单"}
    ]
    const colorRangeEnum = [
        { nodeType: 1, partBg: '#E8F4FF', partTextClolr: '#1890FF' },
        { nodeType: 2, partBg: '#E8F4FF', partTextClolr: '#1890FF' },
        { nodeType: 3, partBg: '#E7F9F9', partTextClolr: '#13C2CD' },
        { nodeType: 4, partBg: '#E7F9F9', partTextClolr: '#13C2CD' },
        { nodeType: 5, partBg: '#FFEEE5', partTextClolr: '#FE9400' },
        { nodeType: 6, partBg: '#FFEEE5', partTextClolr: '#FE9400' },
        // {nodeType:7,partBg:'#F5DBD8',partTextClolr:'#EA2E17'},
    ]
    this.partSize = partSize || 14;
    this.nameSize = nameSize || 14;
    this.partTextHeight = this.partSize
    this.nameTextHeight = this.nameSize
    this.data = data;
    this.colorRange = colorRange || colorRangeEnum
    this.nameKey = nameKey
    this.nodeTypeNameEmun = nodeTypeNameEmun || typeEmun
    this.isAutoFitColumn = isAutoFitColumn || false
    this.textWidth = 0
    this.nodeTypeKey = nodeTypeKey
    this.parentId = parentId
    this.isNeedTip =  typeof isNeedTip == 'boolean' ? (isNeedTip.toString() == 'false'?isNeedTip = false:isNeedTip = true):isNeedTip = true
    this.stringArr = stringArr || []
    this.linkChart = linkChart || '-'
    this.lineHeight = lineHeight || 48
    this.zIndex = zIndex || 1700
}

customCellType.prototype = new spreadNS.CellTypes.Text();
customCellType.prototype.paintContent = function (ctx, value, x, y, w, h, style, context) {

    let textTotalWidth = 0
    let row = context.row
    let nodeTypeName = ''
    if(this.nodeTypeKey && this.data && this.data.length){
        nodeTypeName = findFromArr((this.data[row])[this.nodeTypeKey],this.nodeTypeNameEmun)
    }else{
        nodeTypeName = findFromArr(value,this.nodeTypeNameEmun)
    }
    if (!ctx || !this.data.length) {
        return;
    }

    // ctx.save();

    // ctx.rect(x, y, w, h);
    // ctx.clip();
    ctx.beginPath();

    //获取文字属性
    let textInfo = ctx.measureText(nodeTypeName)
    //计算矩形宽度并暂时赋值给单元格总宽度
    textTotalWidth += Math.ceil(textInfo.width)
    let index = ''
    if(this.nodeTypeKey && this.data && this.data.length){
        index = findFromArr((this.data[row])[this.nodeTypeKey],this.colorRange,true)
    }else{
        index = findFromArr(value,this.colorRange,true)
    }
    //绘制矩形
    if(this.colorRange && this.colorRange.length){
        if(index>-1 && (this.data[row])[this.nameKey]){
            ctx.fillStyle = this.colorRange[index].partBg;
        }
    }else{
        ctx.fillStyle = "#ccc"
    }
    if((this.data[row])[this.nameKey] && index > -1){
        ctx.fillRect(x+5, y+(h-this.partTextHeight)/2-5, Math.ceil(textInfo.width)+10, this.partTextHeight+10);
    }

    //绘制矩形内文字
    ctx.beginPath();
    ctx.textAlign="start";
    ctx.textBaseline = 'top';
    if(this.colorRange && this.colorRange.length){
        if(index>-1 && (this.data[row])[this.nameKey]){
            ctx.fillStyle = this.colorRange[index].partTextClolr;
        }
    }else{
        ctx.fillStyle = "#000"
    }
    if(this.partSize){
        ctx.font = this.partSize + "px Arial";
    }
    if((this.data[row])[this.nameKey]){
        ctx.fillText(nodeTypeName,x+10,y+(h-this.partTextHeight)/2+2);
    }

    //绘制矩形后面文字
    if(this.nameKey){
        ctx.beginPath();
        ctx.textAlign="start";
        ctx.fillStyle = '#000';
        ctx.textBaseline = 'top';
        //计算后面跟随文字的宽度
        if(this.nameSize){
            ctx.font = this.nameSize + "px Arial";
        }
        let afterText = (this.data[row])[this.nameKey];
        textTotalWidth += Math.ceil(ctx.measureText(afterText).width)

        if(afterText && afterText != "null"){
            let afterTextWidth = w-Math.ceil(textInfo.width)-20-5
            let tmpObj = fittingString(ctx,afterText,afterTextWidth)
            afterText = tmpObj.newStr
            ctx.fillText(afterText,x+Math.ceil(textInfo.width)+20,y+(h-this.nameTextHeight)/2+2);
        }
    }

    //列宽的撑开是根据最后一次算的值的大小来撑开的，如果值小于目前的宽度则不进行赋值
    this.textWidth = textTotalWidth > this.textWidth ? textTotalWidth : this.textWidth
    // this.textWidth = textTotalWidth
    // ctx.restore();
};
customCellType.prototype.getAutoFitWidth = function (value, text, cellStyle, zoomFactor, context) {
    if(this.isAutoFitColumn){
        let orginWidth = GC.Spread.Sheets.CellTypes.Text.prototype.getAutoFitWidth.call(this, value, text, cellStyle, zoomFactor, context);
        return orginWidth + this.textWidth*0.6 ;
    }
}
customCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context,value) {
	return {
		x: x,
		y: y,
		row: context.row,
		col: context.col,
		cellStyle: cellStyle,
		cellRect: cellRect,
        sheetArea: context.sheetArea,
        context:context
	};
}
customCellType.prototype.processMouseEnter = function (hitinfo) {
    if(!this.isNeedTip){
        return
    }
    let event = event || window.event;
    let mousePageX  = event.pageX;
    let mousePageY  = event.pageY;
    let screenWidth = document.body.clientWidth
    let { sheet, cellRect, row:cellRow, col:cellCol, x:mouseX,y:mouseY } = hitinfo
    let xDiff = mousePageX - mouseX
    let yDiff = mousePageY - mouseY
    //清除已有的弹框及下方黑三角
    let divDom = document.getElementById("__spread_customTipCellType__")
    let arrowDom = document.getElementById("__spread_customTip_arrow__")
    if (divDom) {
        if (!document.getElementById('root')) {
            return
        }
        document.getElementById('root').removeChild(divDom);
        document.getElementById('root').removeChild(arrowDom);
        this._toolTipElement = null;
        this._toolTipArrow = null;
    }
    if(!cellRect){
        return
    }
    let {width:cellWidth,height:cellHeight,x:cellX,y:cellY} = cellRect
    let cellPageX = cellX + xDiff
    let cellPageY = cellY + yDiff
    let cellVAlue = sheet.getValue(cellRow,cellCol)
    if(!cellVAlue){
        return
    }
    let maxWidth = cellWidth>350?cellWidth:350
	if (!document.getElementById("__spread_customTipCellType__")) {
        let div = document.createElement("div");
            div.setAttribute("id",'__spread_customTipCellType__')
            div.style.position = "absolute"
            div.style.boxShadow = "1px 2px 5px rgba(0,0,0,0.4)"
            div.style.borderRadius = "5px"
            div.style.font = "Arial"
            div.style.background = "#404040"
            div.style.wordBreak = "break-all"
            div.style.color = "#fff"
            div.style.padding = "6px 8px"
            div.style.zIndex = this.zIndex
            div.style.minWidth = cellWidth  + "px"
            div.style.maxWidth = maxWidth  + "px"

        this._toolTipElement = div;

        //绘制指示箭头
        let arrow = document.createElement("div");
            arrow.setAttribute("id",'__spread_customTip_arrow__')
            arrow.style.position = "absolute"
            arrow.style.font = "Arial"
            arrow.style.background = "#404040"
            arrow.style.width = "10px"
            arrow.style.height = "10px"
            arrow.style.color = "#fff"
            arrow.style.transform= "rotate(45deg) "
            arrow.style.zIndex = this.zIndex - 1

        this._toolTipArrow = arrow
    }
    let strEncode = ''
    if(this.stringArr && this.stringArr.length){
        let showStrArr = []
        for (let s = 0; s < this.stringArr.length; s++) {
            let ele = this.stringArr[s];
            if (ele == this.nodeTypeKey){
                showStrArr.push(findFromArr((this.data[cellRow])[this.nodeTypeKey],this.nodeTypeNameEmun))
            }else{
                showStrArr.push(this.data[cellRow][ele])
            }
        }
        if(showStrArr.length){
            let str = ''
            if(this.linkChart){
                str = showStrArr.join(this.linkChart)
            }else{
                str = showStrArr.join('-')
            }
            strEncode = HTMLEncode(str)
        }
    }else{
        strEncode = HTMLEncode(this.data[cellRow][this.nameKey])
    }
    if(!strEncode){
        return
    }
    this._toolTipElement.innerHTML = strEncode
    document.getElementById('root').append(this._toolTipElement)
    document.getElementById('root').append(this._toolTipArrow)

    let h = document.getElementById("__spread_customTipCellType__").offsetHeight
    let w = document.getElementById("__spread_customTipCellType__").offsetWidth
    let topVal = 0
    let leftVal = cellPageX
    let arrowTop = cellPageY
    if(h<cellPageY){
        topVal = cellPageY - h -5
        arrowTop = cellPageY-12
    }else{
        topVal = cellPageY + this.lineHeight + 5
        arrowTop = cellPageY + this.lineHeight
    }
    if(leftVal+w>screenWidth){
        leftVal = leftVal - (leftVal + w -screenWidth )
    }
    this._toolTipElement.style.top = topVal + "px"
    this._toolTipElement.style.left = leftVal + "px"
    // if(this.arrowPosition == "center"){
        this._toolTipArrow.style.top = arrowTop+  "px"
        this._toolTipArrow.style.left = cellPageX + cellWidth/2 - 7 + "px"
    // }else if(this.arrowPosition == "left"){
        // this._toolTipArrow.style.top = arrowTop +  "px"
        // let tmpW = cellWidth*0.25>15?15:cellWidth*0.25
        // this._toolTipArrow.style.left = cellPageX + tmpW + "px"
    // }else if(this.arrowPosition == "right"){
        // this._toolTipArrow.style.top = arrowTop +  "px"
        // this._toolTipArrow.style.left = cellPageX + cellWidth - cellWidth*0.15+ "px"
    // }
};
customCellType.prototype.processMouseLeave = function (hitinfo) {
	let divDom = document.getElementById("__spread_customTipCellType__")
    let arrowDom = document.getElementById("__spread_customTip_arrow__")
    if (divDom) {
        if (!document.getElementById('root')) {
            return
        }
		document.getElementById('root').removeChild(divDom);
		document.getElementById('root').removeChild(arrowDom);
		this._toolTipElement = null;
		this._toolTipArrow = null;
	}
};


/**
 * TipCellType 悬浮提示内容
 *
 * @param {*} parentId 表格最外层容器Id position属性应为relative
 * @param {string} arrowPosition 指示箭头位置取值范围["left","center","right"],默认值为center
 * @param {Number} zIndex toolTip显示层级，默认1700
 * @param {Number} lineHeight 单元格高度，默认48
 */
export function TipCellType(parentId,arrowPosition,textSize,zIndex,lineHeight) {
    this.parentId = parentId
    this.arrowPosition = arrowPosition || 'center'
    this.textSize = textSize || 14
    this.textHeight = this.textSize
    this.lineHeight = lineHeight || 48
    this.zIndex = zIndex || 1700
}
// TipCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
TipCellType.prototype = new spreadNS.CellTypes.Text();
TipCellType.prototype.paintContent = function (ctx, value, x, y, w, h, style, context) {
    if(!ctx ||!value){
        return
    }

    ctx.font = this.textSize + 'px Arial'

    let res = fittingString(ctx, value, w - 5);
    value = res.newStr
    let isEllipsis = res.isEllipsis
    ctx.beginPath();
    ctx.textAlign="start";
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'top';
    let textWidth = Math.ceil(ctx.measureText(value).width)
    // if(isEllipsis){
        ctx.fillText(value,x+5,y+(h-this.textHeight)/2);
    // }else{
    //     if(this.textAlign == 'left'){
    //         ctx.fillText(value,x+5,y+(h-this.textHeight)/2);
    //     }else if(this.textAlign == 'center'){
    //         ctx.fillText(value,x+(w/2-textWidth/2),y+(h-this.textHeight)/2);
    //     }else if(this.textAlign == 'right'){
    //         ctx.fillText(value,x+(w-textWidth-5),y+(h-this.textHeight)/2);
    //     }
    // }
};
TipCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context,value) {
	return {
		x: x,
		y: y,
		row: context.row,
		col: context.col,
		cellStyle: cellStyle,
		cellRect: cellRect,
        sheetArea: context.sheetArea,
        context:context
	};
}
TipCellType.prototype.processMouseEnter = function (hitinfo) {
    let event = event || window.event;
    let mousePageX  = event.pageX;
    let mousePageY  = event.pageY;
    let screenWidth = document.body.clientWidth
    let { sheet, cellRect, row:cellRow, col:cellCol, x:mouseX,y:mouseY } = hitinfo
    let xDiff = mousePageX - mouseX
    let yDiff = mousePageY - mouseY
    //清除已有的弹框及下方黑三角
    let divDom = document.getElementById("__spread_customTipCellType__")
    let arrowDom = document.getElementById("__spread_customTip_arrow__")
    if (divDom) {
        if (!document.getElementById('root')) {
            return
        }
        document.getElementById('root').removeChild(divDom);
        document.getElementById('root').removeChild(arrowDom);
        this._toolTipElement = null;
        this._toolTipArrow = null;
    }
    if(!cellRect){
        return
    }
    let {width:cellWidth,height:cellHeight,x:cellX,y:cellY} = cellRect
    let cellPageX = cellX + xDiff
    let cellPageY = cellY + yDiff
    let cellVAlue = sheet.getValue(cellRow,cellCol)
    if(!cellVAlue){
        return
    }
    let maxWidth = cellWidth>350?cellWidth:350
	if (!document.getElementById("__spread_customTipCellType__")) {
        let div = document.createElement("div");
            div.setAttribute("id",'__spread_customTipCellType__')
            div.style.position = "absolute"
            div.style.boxShadow = "1px 2px 5px rgba(0,0,0,0.4)"
            div.style.borderRadius = "5px"
            div.style.font = "Arial"
            div.style.background = "#404040"
            div.style.wordBreak = "break-all"
            div.style.color = "#fff"
            div.style.padding = "6px 8px"
            div.style.zIndex =  this.zIndex
            div.style.minWidth = cellWidth  + "px"
            div.style.maxWidth = maxWidth  + "px"

        this._toolTipElement = div;

        //绘制指示箭头
        let arrow = document.createElement("div");
            arrow.setAttribute("id",'__spread_customTip_arrow__')
            arrow.style.position = "absolute"
            arrow.style.font = "Arial"
            arrow.style.background = "#404040"
            arrow.style.width = "10px"
            arrow.style.height = "10px"
            arrow.style.color = "#fff"
            arrow.style.transform= "rotate(45deg) "
            arrow.style.zIndex =  this.zIndex - 1

        this._toolTipArrow = arrow
    }
    let strEncode = HTMLEncode(cellVAlue)
    this._toolTipElement.innerHTML = strEncode
    document.getElementById('root').append(this._toolTipElement)
    document.getElementById('root').append(this._toolTipArrow)

    let h = document.getElementById("__spread_customTipCellType__").offsetHeight
    let w = document.getElementById("__spread_customTipCellType__").offsetWidth
    let topVal = 0
    let leftVal = cellPageX
    let arrowTop = cellPageY
    if(h<cellPageY){
        topVal = cellPageY - h -5
        arrowTop = cellPageY-12
    }else{
        topVal = cellPageY + this.lineHeight + 5
        arrowTop = cellPageY + this.lineHeight
    }
    if(leftVal+w>screenWidth){
        leftVal = leftVal - (leftVal + w -screenWidth )
    }
    this._toolTipElement.style.top = topVal + "px"
    this._toolTipElement.style.left = leftVal + "px"
    if(this.arrowPosition == "center"){
        this._toolTipArrow.style.top = arrowTop+  "px"
        this._toolTipArrow.style.left = cellPageX + cellWidth/2 - 7 + "px"
    }else if(this.arrowPosition == "left"){
        this._toolTipArrow.style.top = arrowTop +  "px"
        let tmpW = cellWidth*0.25>15?15:cellWidth*0.25
        this._toolTipArrow.style.left = cellPageX + tmpW + "px"
    }else if(this.arrowPosition == "right"){
        this._toolTipArrow.style.top = arrowTop +  "px"
        this._toolTipArrow.style.left = cellPageX + cellWidth - cellWidth*0.15+ "px"
    }
};
TipCellType.prototype.processMouseLeave = function (hitinfo) {
	let divDom = document.getElementById("__spread_customTipCellType__")
    let arrowDom = document.getElementById("__spread_customTip_arrow__")
    if (divDom) {
        if (!document.getElementById('root')) {
            return
        }
		document.getElementById('root').removeChild(divDom);
		document.getElementById('root').removeChild(arrowDom);
		this._toolTipElement = null;
		this._toolTipArrow = null;
	}
};



/**
 * EllipsisTextCellType 超出省略显示...
 *
 * @param {string} textAlign 文字位置["left","center","right"],默认值为left，居左
 * @param {number} textSize 文字大小 默认14
 */
export function EllipsisTextCellType(textAlign,textSize) {
    this.textAlign = textAlign || 'left'
    this.textY = 21
    this.textSize = textSize || 14
    this.textHeight = this.textSize
}

EllipsisTextCellType.prototype = new spreadNS.CellTypes.Text();
EllipsisTextCellType.prototype.paintContent = function (ctx, value, x, y, w, h, style, context) {
    ctx.font = this.textSize + 'px Arial'
    let res = fittingString(ctx, value, w - 5);
    value = res.newStr
    let isEllipsis = res.isEllipsis
    ctx.beginPath();
    ctx.textAlign="start";
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'top';
    let textWidth = Math.ceil(ctx.measureText(value).width)
    if(isEllipsis){
        ctx.fillText(value,x+2,y+5+this.textHeight);
    }else{
        if(this.textAlign == 'left'){
            ctx.fillText(value,x+5,y+5+this.textHeight);
        }else if(this.textAlign == 'center'){
            ctx.fillText(value,x+(w/2-textWidth/2),y+5+this.textHeight);
        }else if(this.textAlign == 'right'){
            ctx.fillText(value,x+(w-textWidth-5),y+5+this.textHeight);
        }
    }
};




/**
 * EllipsisAndToolTip 超出隐藏显示...，并显示toolTip
 *
 * @param {*} parentId 表格最外层容器Id position属性应为relative
 * @param {string} arrowPosition 指示箭头位置取值范围["left","center","right"],默认值与文字位置保持一致"left"，居左
 * @param {string} textAlign 文字位置["left","center","right"],默认值为left，居左
 * @param {number} textSize 文字大小  默认14
 * @param {Number} zIndex toolTip显示层级，默认1700
 * @param {Number} lineHeight 单元格高度，默认48
 */
export function EllipsisAndToolTip(parentId, textAlign ,textSize, arrowPosition,zIndex, lineHeight){
    this.parentId = parentId
    this.textAlign = textAlign || "center"
    this.arrowPosition = arrowPosition || 'right'
    // this.textY = textY || 21
    this.textY =  21
    this.textSize = textSize || 14
    this.textHeight = this.textSize
    this.lineHeight = lineHeight || 48
    this.zIndex = zIndex || 1700
}
EllipsisAndToolTip.prototype = new spreadNS.CellTypes.Text();
EllipsisAndToolTip.prototype.paintContent = function (ctx, value, x, y, w, h, style, context) {
    if(!ctx ||!value){
        return
    }

    ctx.font = this.textSize + 'px Arial'

    let res = fittingString(ctx, value, w - 5);
    value = res.newStr
    let isEllipsis = res.isEllipsis
    ctx.beginPath();
    ctx.textAlign="start";
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'top';
    let textWidth = Math.ceil(ctx.measureText(value).width)
    if(isEllipsis){
        ctx.fillText(value,x+5,y+(h-this.textHeight)/2);
    }else{
        if(this.textAlign == 'left'){
            ctx.fillText(value,x+5,y+(h-this.textHeight)/2);
        }else if(this.textAlign == 'center'){
            ctx.fillText(value,x+(w/2-textWidth/2),y+(h-this.textHeight)/2);
        }else if(this.textAlign == 'right'){
            ctx.fillText(value,x+(w-textWidth-5),y+(h-this.textHeight)/2);
        }
    }
};

EllipsisAndToolTip.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context,value) {
	return {
		x: x,
		y: y,
		row: context.row,
		col: context.col,
		cellStyle: cellStyle,
		cellRect: cellRect,
        sheetArea: context.sheetArea,
        context:context
	};
}
EllipsisAndToolTip.prototype.processMouseEnter = function (hitinfo) {
    let event = event || window.event;
    let mousePageX  = event.pageX;
    let mousePageY  = event.pageY;
    let screenWidth = document.body.clientWidth
    let { sheet, cellRect, row:cellRow, col:cellCol, x:mouseX,y:mouseY } = hitinfo
    let xDiff = mousePageX - mouseX
    let yDiff = mousePageY - mouseY
    //清除已有的弹框及下方黑三角
    let divDom = document.getElementById("__spread_customTipCellType__")
    let arrowDom = document.getElementById("__spread_customTip_arrow__")
    if (divDom) {
        if (!document.getElementById('root')) {
            return
        }
        document.getElementById('root').removeChild(divDom);
        document.getElementById('root').removeChild(arrowDom);
        this._toolTipElement = null;
        this._toolTipArrow = null;
    }
    if(!cellRect){
        return
    }
    let {width:cellWidth,height:cellHeight,x:cellX,y:cellY} = cellRect
    let cellPageX = cellX + xDiff
    let cellPageY = cellY + yDiff
    let cellVAlue = sheet.getValue(cellRow,cellCol)
    if(!cellVAlue){
        return
    }
    let maxWidth = cellWidth>350?cellWidth:350
	if (!document.getElementById("__spread_customTipCellType__")) {
        let div = document.createElement("div");
            div.setAttribute("id",'__spread_customTipCellType__')
            div.style.position = "absolute"
            div.style.boxShadow = "1px 2px 5px rgba(0,0,0,0.4)"
            div.style.borderRadius = "5px"
            div.style.font = "Arial"
            div.style.background = "#404040"
            div.style.wordBreak = "break-all"
            div.style.color = "#fff"
            div.style.padding = "6px 8px"
            div.style.zIndex = this.zIndex
            div.style.minWidth = cellWidth  + "px"
            div.style.maxWidth = maxWidth  + "px"

        this._toolTipElement = div;

        //绘制指示箭头
        let arrow = document.createElement("div");
            arrow.setAttribute("id",'__spread_customTip_arrow__')
            arrow.style.position = "absolute"
            arrow.style.font = "Arial"
            arrow.style.background = "#404040"
            arrow.style.width = "10px"
            arrow.style.height = "10px"
            arrow.style.color = "#fff"
            arrow.style.transform= "rotate(45deg) "
            arrow.style.zIndex = this.zIndex - 1

        this._toolTipArrow = arrow
    }
    let strEncode = HTMLEncode(cellVAlue)
    this._toolTipElement.innerHTML = strEncode
    document.getElementById('root').append(this._toolTipElement)
    document.getElementById('root').append(this._toolTipArrow)

    let h = document.getElementById("__spread_customTipCellType__").offsetHeight
    let w = document.getElementById("__spread_customTipCellType__").offsetWidth
    let topVal = 0
    let leftVal = cellPageX
    let arrowTop = cellPageY
    if(h<cellPageY){
        topVal = cellPageY - h -5
        arrowTop = cellPageY-12
    }else{
        topVal = cellPageY + this.lineHeight + 5
        arrowTop = cellPageY + this.lineHeight
    }
    if(leftVal+w>screenWidth){
        leftVal = leftVal - (leftVal + w -screenWidth )
    }
    this._toolTipElement.style.top = topVal + "px"
    this._toolTipElement.style.left = leftVal + "px"
    if(this.arrowPosition == "center"){
        this._toolTipArrow.style.top = arrowTop+  "px"
        this._toolTipArrow.style.left = cellPageX + cellWidth/2 - 7 + "px"
    }else if(this.arrowPosition == "left"){
        this._toolTipArrow.style.top = arrowTop +  "px"
        let tmpW = cellWidth*0.25>15?15:cellWidth*0.25
        this._toolTipArrow.style.left = cellPageX + tmpW + "px"
    }else if(this.arrowPosition == "right"){
        this._toolTipArrow.style.top = arrowTop +  "px"
        this._toolTipArrow.style.left = cellPageX + cellWidth - cellWidth*0.15+ "px"
    }
};
EllipsisAndToolTip.prototype.processMouseLeave = function (hitinfo) {
	let divDom = document.getElementById("__spread_customTipCellType__")
    let arrowDom = document.getElementById("__spread_customTip_arrow__")
    if (divDom) {
        if (!document.getElementById('root')) {
            return
        }
		document.getElementById('root').removeChild(divDom);
		document.getElementById('root').removeChild(arrowDom);
		this._toolTipElement = null;
		this._toolTipArrow = null;
	}
};


/**
 * HyperLinkTextCell  超链接+文本测试
 * @param {array} linkArr 超链接属性 形如：[{name:'引用',color:'red',clickFun:function,tipText,isDot:false,dotColor:'red'}]  name:超链接文本，color:超链接文本颜色，clickFun:超链接点击执行方法,tipText:超链接悬浮显示文字，若不传则显示name,isDot:是否需要标点。dotColor:标点颜色，默认红色
 * @param {string} parentId 表格最外层容器Id position属性应为relative
 * @param {number} textMaxWidth 普通文本宽度 不传则自动计算除超链接的宽度赋予文本宽度，超出隐藏
 * @param {number} textSize 普通文本大小 默认14
 * @param {number} linkSize 超链接文本大小 默认14
 * @param {boolean} needTip 是否需要toolTip 默认true
 * @param {string} linkAlign 无文本时 超链接的水平对齐方式 默认为'right'
 * @param {Number} zIndex toolTip显示层级，默认1700
 * @param {Number} lineHeight 单元格高度，默认48
 *
 */
export function HyperLinkTextCell(linkArr, parentId,linkAlign, textSize, linkSize, textMaxWidth, needTip = true,zIndex,lineHeight ) {
    this.linkArr = linkArr || []
    this.linkTextStr = ""
    this.textY = 21
    this.linkY = 21
    this.linArea = []
    this.linkNum = 0
    this.textWidth = 0
    this.textWidthArr = {} //普通文本宽度集合
    // this.textWidthArr = [] //普通文本宽度集合
    this.textMaxWidth = textMaxWidth
    this.textSize = textSize || 14
    this.linkSize = linkSize || 14
    this.textHeight = this.textSize //普通文本文字高度
    this.linkHeight = this.linkSize //超链接文本文字高度
    this.needTip = needTip
    this.parentId = parentId
    this.linkAlign = linkAlign || 'right'
    this.lineHeight = lineHeight || 48
    this.zIndex = zIndex || 1700
    this.dotNum = 0
    if(linkArr){
        this.linkNum = linkArr.length
        for (let i = 0; i < linkArr.length; i++) {
            const item = linkArr[i];
            this.linkTextStr+=item.name
            if(item.isDot){
                this.dotNum ++
            }
        }
    }

    this.plainTextWidth = 0
}

/**
 * 用于过滤并形成最后需要省略显示的文字
 *
 * @param {*} c canvas画笔
 * @param {*} str 要显示的字符串
 * @param {*} cellWidth 单元格宽度
 * @param {*} linkTextStr 超链接所有文本内容
 * @param {*} linkNum 超链接个数
 * @param {*} dotNum 超链接标点个数（超链接标点的圆半径为4，向后间隔为15）
 * @param {*} maxWidth 最大宽度
 */
let fittingStringForHyperLink = (c, str, cellWidth,linkTextStr,linkNum,dotNum,maxWidth) => {
    let result = ''
    let width = 0
    let start = 0
    let end = JSON.parse(JSON.stringify(str)).length
    let len = JSON.parse(JSON.stringify(str)).length
    if(str){
        width = c.measureText(str).width;
    }
    let ellipsis = '…';
    let ellipsisWidth = c.measureText(ellipsis).width;
    let hyperLinkTextWidth = c.measureText(linkTextStr).width + dotNum*23 ;
    let textMaxWidth = maxWidth || cellWidth- 20 - hyperLinkTextWidth - 10*(linkNum-1)
    if (width <= textMaxWidth || width <= ellipsisWidth) {
        return result = {
          newStr: str,
          textWidth:c.measureText(str).width,
          textMaxWidth: textMaxWidth
        };
    } else {
        // while (width >= textMaxWidth - ellipsisWidth && len-- > 0) {
        //     str = str.substring(0, len);
        //     width = c.measureText(str).width;
        // }
        // textMaxWidth = textMaxWidth - ellipsisWidth
        let newStr = strReduce(c,str,len,textMaxWidth - ellipsisWidth,end,start)
        return result = {
        //   newStr: str + ellipsis,
          newStr: newStr + ellipsis,
          textWidth: textMaxWidth,
          textMaxWidth: textMaxWidth
        };
    }
}
HyperLinkTextCell.prototype = new spreadNS.CellTypes.Base();

// HyperLinkTextCell.prototype.paintContent = function (ctx, value, x, y, w, h, style, context) {
HyperLinkTextCell.prototype.paintContent = function (ctx, value, x, y, w, h, style, context) {
    ctx.font = style.font;
    let newValue = ''
    let textWidth = 0
    let dotWidthSum = 0
    if(value){
        ctx.font = this.textSize + 'px Arial';
        let fittingres = fittingStringForHyperLink(ctx, value,  w - 2, this.linkTextStr,this.linkNum ,this.dotNum, this.textMaxWidth);
        newValue = fittingres.newStr
        this.textWidth = fittingres.textWidth == this.textMaxWidth?this.textMaxWidth:fittingres.textWidth
        this.textMaxWidth = this.textMaxWidth || fittingres.textMaxWidth
        let row = context.row
        if(!this.textWidthArr["row"+row]){
            this.textWidthArr["row"+row] = {textWidth:Math.ceil(this.textWidth),text:value} //存储普通文本长度及文本内容
        }
        ctx.beginPath();

        // //获取文字属性
        let textInfo = ctx.measureText(newValue)
        //绘制普通文本
        ctx.textAlign="start";
        ctx.fillStyle = '#000';
        ctx.textBaseline = 'top';
        if(newValue){
            textWidth = this.textMaxWidth+10
            ctx.fillText(newValue,x+5,y+(h-this.textHeight)/2);
        }
    }else{
        let hyperLinkTextWidth = ctx.measureText(this.linkTextStr).width;
        this.textMaxWidth = w-2 - 20 - hyperLinkTextWidth - 10*(this.linkNum-1)
        if(this.linkAlign == 'right'){
            textWidth = this.textMaxWidth+10
        }else if(this.linkAlign == 'left'){
            textWidth = 0
        }else if(this.linkAlign == 'center'){
            let linkInfo = ctx.measureText(this.linkTextStr)
            textWidth = (w-2)/2 - ((this.linkNum-1)*10 + Math.ceil(linkInfo.width))/2
        }
    }
        //绘制超链接文本
        for (let k = 0; k < this.linkArr.length; k++) {
            ctx.beginPath();
            const ele = this.linkArr[k];
            if(ele.isDot){ //超链接如果要前面画点
                ctx.beginPath();
                ctx.arc(x+5+5+textWidth,y+(h-this.textHeight)/2+5,4,0,360,false);
                ctx.fillStyle=ele.dotColor?ele.dotColor:"red";//填充颜色,默认是黑色
                ctx.fill();//画实心圆
                ctx.closePath();
                dotWidthSum =  15
            }else{
                dotWidthSum = 0
            }
            ctx.textAlign="start";
            ctx.textBaseline = 'top';
            ctx.fillStyle = ele.color || "#000";
            ctx.font = this.linkSize +'px Arial'
            ctx.fillText(ele.name,x+5+textWidth + dotWidthSum ,y+(h-this.textHeight)/2);
            let currentLinkTextWidth = Math.ceil(ctx.measureText(ele.name).width);
            //存储绘制的相对于单元格的始末相对坐标，以避免出现横向滚动条时，滚动后坐标相对位置发生改变，导致需要用坐标进行定位的Tips以及点击事件出现异常
            if(!this.linArea[context.row]){
                this.linArea[context.row]= [{startX:5+textWidth ,endX:5+textWidth + currentLinkTextWidth + dotWidthSum,name:ele.name,row:context.row,tipText:ele.tipText||ele.name}]
            }else{
                (this.linArea[context.row])[k]= {startX:5+textWidth,endX:5+textWidth + currentLinkTextWidth + dotWidthSum,name:ele.name,row:context.row,tipText:ele.tipText||ele.name}
            }

            textWidth += Math.ceil(ctx.measureText(ele.name).width)+10 + dotWidthSum
        }
};
HyperLinkTextCell.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {

	let res = ismouseInArea(x, "", context.row, this.linArea,0,this.textWidthArr)
    this.ismouseInArea = res.ismouseInArea;
	return {
		x: x,
		y: y,
		row: context.row,
		col: context.col,
		cellStyle: cellStyle,
		cellRect: cellRect,
        sheetArea: context.sheetArea,
        context:context,
        isReservedLocation: res.ismouseInArea,
        index:res.index
	};
}
HyperLinkTextCell.prototype.processMouseDown = function (hitinfo) {

    let { sheet, cellRect, row:cellRow, col:cellCol,x:mouseX,y:mouseY } = hitinfo
    //清除已有的弹框及下方黑三角
    let divDom = document.getElementById("__spread_customTipCellType__")
    let arrowDom = document.getElementById("__spread_customTip_arrow__")
    if (divDom) {
        if (!document.getElementById('root')) {
            return
        }
        document.getElementById('root').removeChild(divDom);
        document.getElementById('root').removeChild(arrowDom);
        this._toolTipElement = null;
        this._toolTipArrow = null;
    }
    if(!cellRect){
        return
    }
    let {width:cellWidth,height:cellHeight,x:cellX,y:cellY} = cellRect
    let cellVAlue = sheet.getValue(cellRow,cellCol)
    let res = ismouseInArea(mouseX,"",cellRow,this.linArea,cellX,this.textWidthArr)
    if(res.index>-1){
        let clickFun = this.linkArr[res.index].clickFun
        let divDom = document.getElementById("__spread_customTipCellType__")
        let arrowDom = document.getElementById("__spread_customTip_arrow__")
        if (divDom) {
            if (!document.getElementById('root')) {
                return
            }
            document.getElementById('root').removeChild(divDom);
            document.getElementById('root').removeChild(arrowDom);
            this._toolTipElement = null;
            this._toolTipArrow = null;
        }
        clickFun(hitinfo,cellVAlue)
    }
};
HyperLinkTextCell.prototype.processMouseMove = function (hitinfo) {
    let event = event || window.event;
    let mousePageX  = event.pageX;
    let mousePageY  = event.pageY;
    let screenWidth = document.body.clientWidth
    //清除提示
    let divDom = document.getElementById("__spread_customTipCellType__")
    let arrowDom = document.getElementById("__spread_customTip_arrow__")
    if (divDom) {
        if (!document.getElementById('root')) {
            return
        }
        document.getElementById('root').removeChild(divDom);
        document.getElementById('root').removeChild(arrowDom);
        this._toolTipElement = null;
        this._toolTipArrow = null;
    }
    let { sheet, cellRect, row:cellRow, col:cellCol,x:mouseX,y:mouseY } = hitinfo
    let xDiff = mousePageX - mouseX
    let yDiff = mousePageY - mouseY
    if(!cellRect){
        return
    }
    let {width:cellWidth,height:cellHeight,x:cellX,y:cellY} = cellRect
    let cellPageX = cellX + xDiff
    let cellPageY = cellY + yDiff
    let cellVAlue = sheet.getValue(cellRow,cellCol)
    let res = ismouseInArea(mouseX,"",cellRow,this.linArea,cellX,this.textWidthArr)
    let maxWidth = cellWidth>350?cellWidth:350
    if(res.ismouseInArea){//鼠标悬浮至超链接文字上
        setTimeout(function(){
            if(document.getElementById("vp_vp")){
                document.getElementById("vp_vp").style.cursor  = 'pointer';
            }
        },0)
        if(!this.needTip){
            return
        }
        let index = res.index
        let linkTextWidth = (this.linArea[cellRow])[index].endX - (this.linArea[cellRow])[index].startX 
        if (!document.getElementById("__spread_customTipCellType__")) {
            let div = document.createElement("div");
                div.setAttribute("id",'__spread_customTipCellType__')
                div.style.position = "absolute"
                // div.style.border = "1px #C0C0C0 solid"
                div.style.boxShadow = "1px 2px 5px rgba(0,0,0,0.4)"
                div.style.borderRadius = "5px"
                div.style.font = "Arial"
                div.style.background = "#404040"
                div.style.wordBreak = "break-all"
                div.style.color = "#fff"
                div.style.padding = "6px 8px"
                div.style.zIndex = this.zIndex
                div.style.minWidth = cellWidth  + "px"
                div.style.maxWidth = maxWidth  + "px"

            this._toolTipElement = div;

            //绘制指示箭头
            let arrow = document.createElement("div");
                arrow.setAttribute("id",'__spread_customTip_arrow__')
                arrow.style.position = "absolute"
                arrow.style.font = "Arial"
                arrow.style.background = "#404040"
                arrow.style.width = "10px"
                arrow.style.height = "10px"
                arrow.style.color = "#fff"
                arrow.style.transform= "rotate(45deg) "
                arrow.style.zIndex = this.zIndex - 1

            this._toolTipArrow = arrow
        }
        let strEncode = HTMLEncode((this.linArea[cellRow])[index].tipText)
        this._toolTipElement.innerHTML = strEncode
        document.getElementById('root').append(this._toolTipElement)
        document.getElementById('root').append(this._toolTipArrow)
        let h = document.getElementById("__spread_customTipCellType__").offsetHeight
        let w = document.getElementById("__spread_customTipCellType__").offsetWidth
        let topVal = 0
        let leftVal = cellPageX
        let arrowTop = cellPageY
        if(h<cellPageY){
            topVal = cellPageY - h -5
            arrowTop = cellPageY-12
        }else{
            topVal = cellPageY + this.lineHeight + 5
            arrowTop = cellPageY + this.lineHeight
        }
        if(leftVal+w>screenWidth){
            leftVal = leftVal - (leftVal + w -screenWidth )
        }
        this._toolTipElement.style.top = topVal + "px"
        this._toolTipElement.style.left = leftVal + "px"
        this._toolTipArrow.style.top = arrowTop +  "px"
        this._toolTipArrow.style.left = cellPageX+(this.linArea[cellRow])[index].startX+linkTextWidth/2 - 7 + "px"
    }else if(res.isInTextArea && this.needTip){//鼠标悬浮至普通文本上
        if(!cellVAlue){
            return
        }
        document.body.style.cursor = "auto"
        if (!document.getElementById("__spread_customTipCellType__")) {
            let div = document.createElement("div");
                div.setAttribute("id",'__spread_customTipCellType__')
                div.style.position = "absolute"
                div.style.boxShadow = "1px 2px 5px rgba(0,0,0,0.4)"
                div.style.borderRadius = "5px"
                div.style.font = "Arial"
                div.style.background = "#404040"
                div.style.wordBreak = "break-all"
                div.style.color = "#fff"
                div.style.padding = "6px 8px"
                div.style.zIndex = this.zIndex
                div.style.minWidth = cellWidth  + "px"
                div.style.maxWidth = maxWidth  + "px"

            this._toolTipElement = div;

            //绘制指示箭头
            let arrow = document.createElement("div");
                arrow.setAttribute("id",'__spread_customTip_arrow__')
                arrow.style.position = "absolute"
                arrow.style.font = "Arial"
                arrow.style.background = "#404040"
                arrow.style.width = "10px"
                arrow.style.height = "10px"
                arrow.style.color = "#fff"
                arrow.style.transform= "rotate(45deg) "
                arrow.style.zIndex = this.zIndex - 1

            this._toolTipArrow = arrow
        }
        // this._toolTipElement.innerHTML = this.textWidthArr["row"+cellRow].text
        let strEncode = HTMLEncode((this.textWidthArr["row"+cellRow].text))
        this._toolTipElement.innerHTML = strEncode
        document.getElementById('root').append(this._toolTipElement)
        document.getElementById('root').append(this._toolTipArrow)
        let h = document.getElementById("__spread_customTipCellType__").offsetHeight
        let w = document.getElementById("__spread_customTipCellType__").offsetWidth
        let topVal = 0
        let leftVal = cellPageX
        let arrowTop = cellPageY
        if(h<cellPageY){
            topVal = cellPageY - h -5
            arrowTop = cellPageY-12
        }else{
            topVal = cellPageY + this.lineHeight + 5
            arrowTop = cellPageY + 48
        }
        if(leftVal+w>screenWidth){
            leftVal = leftVal - (leftVal + w -screenWidth )
        }
        this._toolTipElement.style.top = topVal + "px"
        this._toolTipElement.style.left = leftVal + "px"
        this._toolTipArrow.style.top = arrowTop +  "px"
        let tmpW = cellWidth*0.25>15?15:cellWidth*0.25
        this._toolTipArrow.style.left = cellPageX + tmpW + "px"
    }
};
HyperLinkTextCell.prototype.processMouseLeave = function (hitinfo) {
	let divDom = document.getElementById("__spread_customTipCellType__")
    let arrowDom = document.getElementById("__spread_customTip_arrow__")
    if (divDom) {
        if (!document.getElementById('root')) {
            return
        }
		document.getElementById('root').removeChild(divDom);
		document.getElementById('root').removeChild(arrowDom);
		this._toolTipElement = null;
		this._toolTipArrow = null;
	}
};
HyperLinkTextCell.prototype.activeOnClick = function(){
    return !this.ismouseInArea;
}

/**
 * ismouseInArea 判断鼠标是否在特定范围内 返回{ismouseInArea：true|false， index：number，isInTextArea: true|false} ismouseInArea为是否在区域内，index为在区域数组中的下标,isInTextArea：是否悬浮在普通文本区域
 *
 * @param {Number} mouseX 鼠标的X位置
 * @param {Number} mouseY 鼠标的Y位置
 * @param {Number} row 行号
 * @param {Array} areaArr特定区域数组
 * @param {Array} cellX 单元格的起始X位置
 * @param {Array} textWidthArr 普通文本的宽度集合
 */
let ismouseInArea = (mouseX,mouseY,row,areaArr,cellX,textWidthArr) => {
    let res = {index:-1,ismouseInArea:false,isInTextArea:false}
    if(textWidthArr["row"+row] && mouseX < cellX+5+textWidthArr["row"+row].textWidth){
        res = {index:-1,ismouseInArea:false,isInTextArea:true}
        return res
    }
    let arr = areaArr[row]
    for (let j = 0; j < arr.length; j++) {
        const ele = arr[j];
        if(mouseX > cellX+ele.startX && mouseX < cellX+ele.endX){
            res = {index:j,ismouseInArea:true,isInTextArea:false}
            break
        }
    }
    return res
}


/**
 * 使用数据显示内容作为超链接
 *
 * @param {string} parentId 表格最外层容器Id position属性应为relative
 * @param {string} textAlign 文字位置["left","center","right"],默认值为left，居左
 * @param {string} color 文字颜色 默认值 '#000'
 * @param {number} textSize 文字大小 默认值14
 * @param {boolean} needTip 是否需要toolTip  默认值为true
 * @param {function} clickFun 点击方法
 * @param {function} isDot 是否需要标点，默认不需要
 * @param {function} dotColor 标点颜色，默认红色
 * @param {function} lineHeight 单元格高度，默认48
 * @param {function} arrowPosition 指示箭头位置。默认居中
 * @param {Number} zIndex toolTip显示层级，默认1700
 */
export function SingleHyperLinkCell(parentId, textAlign, color = '#000', textSize = 14, needTip = true, clickFun,isDot, dotColor, lineHeight, arrowPosition,zIndex) {
  this.parentId = parentId
  this.textY = 21
  this.textSize = textSize
  this.textHeight = this.textSize
  this.needTip = needTip
  this.color = color
  this.textAlign = textAlign || 'center'
  this.linkAreaArr = []
  this.clickFun = clickFun
  this.arrowPosition = arrowPosition || 'center'
  this.lineHeight = lineHeight || 48
  this.zIndex = zIndex || 1700
  this.isDot = isDot
  this.dotColor = dotColor || 'red'
}
SingleHyperLinkCell.prototype = new spreadNS.CellTypes.Base();

SingleHyperLinkCell.prototype.paintContent = function (ctx, value, x, y, w, h, style, context) {
    if(!ctx){
        return
    }
    let row = context.row
    let res = ''
    if(!value){
        this.linkAreaArr[row] = []
        return
    }
    ctx.font = this.textSize + 'px Arial'
    if(this.isDot){
        res = fittingString(ctx, value, w - 20);
    }else{
        res = fittingString(ctx, value, w - 5);
    }
    value = res.newStr
    let isEllipsis = res.isEllipsis
    let dotWidthSum = 0
    if(this.isDot){ //超链接如果要前面画点
        ctx.beginPath();
        ctx.arc(x+8,y+(h-this.textHeight)/2+5,4,0,360,false);
        ctx.fillStyle=this.dotColor?this.dotColor:"red";//填充颜色,默认是黑色
        ctx.fill();//画实心圆
        ctx.closePath();
        dotWidthSum = 15
    }else{
        dotWidthSum = 0
    }
    ctx.beginPath();
    ctx.textAlign="start";
    ctx.textBaseline = 'top';
    ctx.fillStyle = this.color;
    let textWidth = Math.ceil(ctx.measureText(value).width)
    if(isEllipsis){
        ctx.fillText(value,x+5 +dotWidthSum,y+(h-this.textHeight)/2);
        this.linkAreaArr[row] = [{startX:5 +dotWidthSum ,endX:5+textWidth +dotWidthSum ,name:value}]
    }else{
        if(this.textAlign == 'left'){
            ctx.fillText(value,x+5+dotWidthSum,y+(h-this.textHeight)/2);
            this.linkAreaArr[row] = [{startX:5,endX:5+textWidth,name:value}]
        }else if(this.textAlign == 'center'){
            ctx.fillText(value,x+(w/2-textWidth/2)+ dotWidthSum,y+(h-this.textHeight)/2);
            this.linkAreaArr[row] = [{startX:(w/2-textWidth/2) + dotWidthSum,endX:(w/2-textWidth/2)+textWidth + dotWidthSum,name:value}]
        }else if(this.textAlign == 'right'){
            ctx.fillText(value,x+(w-textWidth-5 - dotWidthSum),y+(h-this.textHeight)/2);
            this.linkAreaArr[row] = [{startX:(w-textWidth-5 -dotWidthSum),endX:(w-textWidth-5 -dotWidthSum)+textWidth,name:value}]
        }
    }
};
SingleHyperLinkCell.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
    let res = ismouseInArea(x, "", context.row, this.linkAreaArr,0,[])
    this.ismouseInArea = res.ismouseInArea;
	return {
		x: x,
		y: y,
		row: context.row,
		col: context.col,
		cellStyle: cellStyle,
		cellRect: cellRect,
        sheetArea: context.sheetArea,
        context:context,
        isReservedLocation: res.ismouseInArea,
        index:res.index
	};
}
SingleHyperLinkCell.prototype.processMouseDown = function (hitinfo) {
    let clickFun = this.clickFun
    setTimeout(() => {
        let divDom = document.getElementById("__spread_customTipCellType__")
        let arrowDom = document.getElementById("__spread_customTip_arrow__")
        if (divDom) {
            if (!document.getElementById('root')) {
                return
            }
            document.getElementById('root').removeChild(divDom);
            document.getElementById('root').removeChild(arrowDom);
            this._toolTipElement = null;
            this._toolTipArrow = null;
        }
    }, 0)
    let { sheet, cellRect, row:cellRow, col:cellCol,x:mouseX,y:mouseY } = hitinfo
    if(!cellRect){
        let divDom = document.getElementById("__spread_customTipCellType__")
        if (divDom) {
            if (!document.getElementById('root')) {
                return
            }
            document.getElementById('root').removeChild(divDom);
            this._toolTipElement = null;
            this._toolTipArrow = null;
        }
        return
    }
    let {width:cellWidth,height:cellHeight,x:cellX,y:cellY} = cellRect
    let cellVAlue = sheet.getValue(cellRow,cellCol)
    let res = ismouseInArea(mouseX,'',cellRow,this.linkAreaArr,cellX,{})
    if(res.index>-1){
        if(clickFun){
            clickFun(hitinfo,cellVAlue)
        }else{
            return
        }
    }
};
SingleHyperLinkCell.prototype.processMouseMove = function (hitinfo) {
    //清除提示
    let event = event || window.event;
    let mousePageX  = event.pageX;
    let mousePageY  = event.pageY;
    let screenWidth = document.body.clientWidth
    let divDom = document.getElementById("__spread_customTipCellType__")
    let arrowDom = document.getElementById("__spread_customTip_arrow__")
    if (divDom) {
        if (!document.getElementById('root')) {
            return
        }
        document.getElementById('root').removeChild(divDom);
        document.getElementById('root').removeChild(arrowDom);
        this._toolTipElement = null;
        this._toolTipArrow = null;
    }
    let { sheet, cellRect, row:cellRow, col:cellCol,x:mouseX,y:mouseY } = hitinfo
    let xDiff = mousePageX - mouseX
    let yDiff = mousePageY - mouseY
    if(!cellRect){
        return
    }
    let {width:cellWidth,height:cellHeight,x:cellX,y:cellY} = cellRect
    let cellPageX = cellX + xDiff
    let cellPageY = cellY + yDiff
    let cellVAlue = sheet.getValue(cellRow,cellCol)
    if(!cellVAlue){
        return
    }
    let res = ismouseInArea(mouseX,'',cellRow,this.linkAreaArr,cellX,{})
    if(res.ismouseInArea){//鼠标悬浮至超链接文字上
        setTimeout(function(){
            if (document.getElementById("vp_vp")) {
              document.getElementById("vp_vp").style.cursor = 'pointer';
            }
        },0)
        if(!this.needTip){
            return
        }
        let maxWidth = cellWidth>350?cellWidth:350
        if (!document.getElementById("__spread_customTipCellType__")) {
            let div = document.createElement("div");
                div.setAttribute("id",'__spread_customTipCellType__')
                div.style.position = "absolute"
                div.style.boxShadow = "1px 2px 5px rgba(0,0,0,0.4)"
                div.style.borderRadius = "5px"
                div.style.font = "Arial"
                div.style.background = "#404040"
                div.style.wordBreak = "break-all"
                div.style.color = "#fff"
                div.style.padding = "6px 8px"
                div.style.zIndex = this.zIndex
                div.style.maxWidth = maxWidth + "px"
                div.style.minWidth = cellWidth + "px"


            this._toolTipElement = div;

            //绘制指示箭头
            let arrow = document.createElement("div");
                arrow.setAttribute("id",'__spread_customTip_arrow__')
                arrow.style.position = "absolute"
                arrow.style.font = "Arial"
                arrow.style.background = "#404040"
                arrow.style.width = "10px"
                arrow.style.height = "10px"
                arrow.style.color = "#fff"
                arrow.style.transform= "rotate(45deg) "
                arrow.style.zIndex = this.zIndex - 1

            this._toolTipArrow = arrow
        }
        let strEncode = HTMLEncode(cellVAlue)
        this._toolTipElement.innerHTML = strEncode
        if(!document.getElementById('root')){
            return
        }
        document.getElementById('root').append(this._toolTipElement)
        document.getElementById('root').append(this._toolTipArrow)

        let h = document.getElementById("__spread_customTipCellType__").offsetHeight
        let w = document.getElementById("__spread_customTipCellType__").offsetWidth
        let topVal = 0
        let leftVal = cellPageX
        let arrowTop = cellPageY
        if(h<cellPageY){
            topVal = cellPageY - h -5
            arrowTop = cellPageY-12
        }else{
            topVal = cellPageY + this.lineHeight + 5
            arrowTop = cellPageY + this.lineHeight
        }
        if(leftVal+w>screenWidth){
            leftVal = leftVal - (leftVal + w - screenWidth )
        }
        this._toolTipElement.style.top = topVal + "px"
        this._toolTipElement.style.left = leftVal + "px"
        if(this.arrowPosition == "center"){
            this._toolTipArrow.style.top = arrowTop+  "px"
            this._toolTipArrow.style.left = cellPageX + cellWidth/2 - 7 + "px"
        }else if(this.arrowPosition == "left"){
            this._toolTipArrow.style.top = arrowTop +  "px"
            let tmpW = cellWidth*0.25>15?15:cellWidth*0.25
            this._toolTipArrow.style.left = cellPageX + tmpW + "px"
        }else if(this.arrowPosition == "right"){
            this._toolTipArrow.style.top = arrowTop +  "px"
            this._toolTipArrow.style.left = cellPageX + cellWidth - cellWidth*0.15+ "px"
        }
    }

};
SingleHyperLinkCell.prototype.processMouseLeave = function (hitinfo) {
    let divDom = document.getElementById("__spread_customTipCellType__")
    let arrowDom = document.getElementById("__spread_customTip_arrow__")
    if (divDom) {
        if (!document.getElementById('root')) {
            return
        }
        document.getElementById('root').removeChild(divDom);
        document.getElementById('root').removeChild(arrowDom);
        this._toolTipElement = null;
        this._toolTipArrow = null;
    }
};
SingleHyperLinkCell.prototype.activeOnClick = function(){
    return !this.ismouseInArea;
}


/**
 * 根据要显示的行数来生成省略后的文字
 *
 * @param {Object} c canvas画笔
 * @param {String} str 要显示的字符串
 * @param {Number} maxWidth 最大宽度
 * @param {Number} lineNum 显示的最大行数
 * @param {Number} zIndex toolTip显示层级，默认1700
 * @param {Number} lineHeight 单元格高度，默认48
 */
let fittingStringByLine = (c, str, maxWidth,lineNum) => {
    maxWidth = maxWidth
    //初始化返回对象obj
    let obj = {newStr:'',isEllipsis:false}
    //
    let width = 0;
    let ellipsis = '…';
    //省略符的绘制宽度
    let ellipsisWidth = c.measureText(ellipsis).width;
    //初始化是否省略为false
    let isEllipsis = false
    //初始化临时数组为空
    let tmpArr = []
    for(let k = 0;k < lineNum; k++){
        let tmpStr = JSON.parse(JSON.stringify(str))
        let tmpStrWdith = c.measureText(tmpStr).width
        let strMaxWidth = 0
        let start = 0
        let end = JSON.parse(JSON.stringify(str)).length
        let len = JSON.parse(JSON.stringify(str)).length
        
        if(k == lineNum -1 && tmpStrWdith > (k+1)*maxWidth){
            strMaxWidth = (k+1)*maxWidth - ellipsisWidth
        }else{
            strMaxWidth = (k+1)*maxWidth
        }
        if(tmpStrWdith>(k-1)*maxWidth && tmpStrWdith>(k)*maxWidth){
            if(tmpStrWdith <= strMaxWidth){
                tmpArr[k] = tmpStr
            }else{
                tmpStr = strReduce(c,str,len,strMaxWidth,end,start)
                if(k == lineNum-1){
                    tmpArr[k] = tmpStr+ellipsis
                    isEllipsis = true
                    // break
                }else{
                    tmpArr[k] = tmpStr
                    // break
                }
            }
        }
    }
    if(tmpArr.length && tmpArr.length>1){
        let tempNewArr = []
        tempNewArr.push(tmpArr[0])
        for(let q = 0;q<tmpArr.length;q++){
            if(q <= tmpArr.length-2){
                let a = tmpArr[q].length
                let b = tmpArr[q+1].substring(a)
                tempNewArr.push(b)
            }
        }
        obj = {newStr:tempNewArr,isEllipsis:isEllipsis}
    }else{
        obj = {newStr:tmpArr,isEllipsis:isEllipsis}
    }

    return obj;

}

/**
 * EllipsisOrderLine 按照定义的行数来显示文字并且超出隐藏显示…，并显示toolTip
 *
 * @param {*} parentId 表格最外层容器Id position属性应为relative
 * @param {string} arrowPosition 指示箭头位置取值范围["left","center","right"],默认值与文字位置保持一致"left"，居左
 * @param {string} textAlign 文字位置["left","center","right"],默认值为left，居左
 * @param {number} textSize 文字大小  默认14
 * @param {number} lineNum 最大显示行数  默认1
 * @param {Number} zIndex toolTip显示层级，默认1700
 * @param {Number} lineHeight 单元格高度，默认48
 */
export function EllipsisOrderLine(parentId,lineNum, textAlign ,textSize , arrowPosition, zIndex, lineHeight){
    this.lineNum = lineNum || 1
    this.parentId = parentId
    this.textAlign = textAlign || "left"
    this.arrowPosition = arrowPosition || this.textAlign
    this.textY =  21
    this.textSize = textSize || 14
    this.textHeight = this.textSize
    this.lineHeight = lineHeight || 48
    this.zIndex = zIndex || 1700
}
EllipsisOrderLine.prototype = new spreadNS.CellTypes.Text();
EllipsisOrderLine.prototype.paintContent = function (ctx, value, x, y, w, h, style, context) {
    if(!ctx ||!value){
        return
    }


    ctx.font = this.textSize + 'px Arial'
    let res = fittingStringByLine(ctx, value, w - 10,this.lineNum);
    let valueArr = res.newStr
    let isEllipsis = res.isEllipsis
    ctx.beginPath();
    ctx.textAlign="start";
    ctx.fillStyle = '#000';
    ctx.textBaseline = 'top';
    if(valueArr.length && valueArr.length == 1){
        let textWidth = Math.ceil(ctx.measureText(valueArr[0]).width)
        if(isEllipsis){
            ctx.fillText(valueArr[0],x+5,y+(h-this.textHeight)/2);
        }else{
            if(this.textAlign == 'left'){
                ctx.fillText(valueArr[0],x+5,y+(h-this.textHeight)/2);
            }else if(this.textAlign == 'center'){
                ctx.fillText(valueArr[0],x+(w/2-textWidth/2),y+(h-this.textHeight)/2);
            }else if(this.textAlign == 'right'){
                ctx.fillText(valueArr[0],x+(w-textWidth-5),y+(h-this.textHeight)/2);
            }
        }
    }else{
            for(let f= 0;f<valueArr.length;f++){
                let starty = y+((h-(this.textHeight*valueArr.length)-5*(valueArr.length-1))/2)+(this.textHeight+5)*f
                let text = valueArr[f]
                ctx.beginPath();
                ctx.textAlign="start";
                ctx.fillStyle = '#000';
                ctx.textBaseline = 'top';
                if(f == valueArr.length-1 && !isEllipsis){
                    let textWidth = Math.ceil(ctx.measureText(valueArr[f]).width)
                    if(this.textAlign == 'left'){
                        ctx.fillText(valueArr[f],x+5,starty);
                    }else if(this.textAlign == 'center'){
                        ctx.fillText(valueArr[f],x+(w/2-textWidth/2),starty);
                    }else if(this.textAlign == 'right'){
                        ctx.fillText(valueArr[f],x+(w-textWidth-5),starty);
                    }
                }else{
                    ctx.fillText(text,x+5,starty);
                }
            }
    }
};

EllipsisOrderLine.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context,value) {
	return {
		x: x,
		y: y,
		row: context.row,
		col: context.col,
		cellStyle: cellStyle,
		cellRect: cellRect,
        sheetArea: context.sheetArea,
        context:context
	};
}
EllipsisOrderLine.prototype.processMouseEnter = function (hitinfo) {
    let event = event || window.event;
    let mousePageX  = event.pageX;
    let mousePageY  = event.pageY;
    let screenWidth = document.body.clientWidth
    //清除已有的提示
    let divDom = document.getElementById("__spread_customTipCellType__")
    let arrowDom = document.getElementById("__spread_customTip_arrow__")
    if (divDom) {
        if (!document.getElementById('root')) {
            return
        }
		document.getElementById('root').removeChild(divDom);
		document.getElementById('root').removeChild(arrowDom);
		this._toolTipElement = null;
		this._toolTipArrow = null;
	}
    let { sheet, cellRect, row:cellRow, col:cellCol,x:mouseX,y:mouseY } = hitinfo
    let xDiff = mousePageX - mouseX
    let yDiff = mousePageY - mouseY
    if(!cellRect){
        return
    }

    let {width:cellWidth,height:cellHeight,x:cellX,y:cellY} = cellRect
    let cellPageX = cellX + xDiff
    let cellPageY = cellY + yDiff
    let cellVAlue = sheet.getValue(cellRow,cellCol)
    if(!cellVAlue){
        return
    }
    let maxWidth = cellWidth>350?cellWidth:350
	if (!document.getElementById("__spread_customTipCellType__")) {
        let div = document.createElement("div");
            div.setAttribute("id",'__spread_customTipCellType__')
            div.style.position = "absolute"
            div.style.boxShadow = "1px 2px 5px rgba(0,0,0,0.4)"
            div.style.borderRadius = "5px"
            div.style.font = "Arial"
            div.style.background = "#404040"
            div.style.wordBreak = "break-all"
            div.style.color = "#fff"
            div.style.padding = "6px 8px"
            div.style.zIndex = this.zIndex
            div.style.maxWidth = maxWidth + 'px'
            div.style.minWidth = cellWidth + "px"

        this._toolTipElement = div;

        //绘制指示箭头
        let arrow = document.createElement("div");
            arrow.setAttribute("id",'__spread_customTip_arrow__')
            arrow.style.position = "absolute"
            arrow.style.font = "Arial"
            arrow.style.background = "#404040"
            arrow.style.width = "10px"
            arrow.style.height = "10px"
            arrow.style.color = "#fff"
            arrow.style.transform= "rotate(45deg) "
            arrow.style.zIndex = this.zIndex - 1

        this._toolTipArrow = arrow
    }
    let strEncode = HTMLEncode(cellVAlue)
    this._toolTipElement.innerHTML = strEncode
    document.getElementById('root').append(this._toolTipElement)
    document.getElementById('root').append(this._toolTipArrow)

    let h = document.getElementById("__spread_customTipCellType__").offsetHeight
    let w = document.getElementById("__spread_customTipCellType__").offsetWidth
    let topVal = 0
    let leftVal = cellPageX
    let arrowTop = cellPageY
    if(h<cellPageY){
        topVal = cellPageY - h -5
        arrowTop = cellPageY-12
    }else{
        topVal = cellPageY + this.lineHeight + 5
        arrowTop = cellPageY + this.lineHeight
    }
    if(leftVal+w>screenWidth){
        leftVal = leftVal - (leftVal + w -screenWidth )
    }
    this._toolTipElement.style.top = topVal+ "px"
    this._toolTipElement.style.left = leftVal + "px"
    if(this.arrowPosition == "center"){
        this._toolTipArrow.style.top = arrowTop+  "px"
        this._toolTipArrow.style.left = cellPageX + cellWidth/2 - 7 + "px"
    }else if(this.arrowPosition == "left"){
        this._toolTipArrow.style.top = arrowTop +  "px"
        let tmpW = cellWidth*0.25>15?15:cellWidth*0.25
        this._toolTipArrow.style.left = cellPageX + tmpW + "px"
    }else if(this.arrowPosition == "right"){
        this._toolTipArrow.style.top = arrowTop +  "px"
        this._toolTipArrow.style.left = cellPageX + cellWidth - cellWidth*0.15+ "px"
    }
};
EllipsisOrderLine.prototype.processMouseLeave = function (hitinfo) {
	let divDom = document.getElementById("__spread_customTipCellType__")
    let arrowDom = document.getElementById("__spread_customTip_arrow__")
    if (divDom) {
        if (!document.getElementById('root')) {
            return
        }
		document.getElementById('root').removeChild(divDom);
		document.getElementById('root').removeChild(arrowDom);
		this._toolTipElement = null;
		this._toolTipArrow = null;
	}
};

export function ManuallyClearTips(){
    let divDom = document.getElementById("__spread_customTipCellType__")
    let arrowDom = document.getElementById("__spread_customTip_arrow__")
    if (divDom) {
        if (!document.getElementById('root')) {
            return
        }
		document.getElementById('root').removeChild(divDom);
		document.getElementById('root').removeChild(arrowDom);
    }
}