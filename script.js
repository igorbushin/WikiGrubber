var originalContent
var currentChar
var contentHolder

$(document).ready(function() {
    contentHolder = document.getElementById("contentHolder")
})

function fetchHTML() {
    updateCurrentChar()
    if(currentChar > 'я') {
        return
    }
    if(!originalContent) {
        loadContent(handleContent)
    }
    else {
        handleContent()
    }
}

function updateCurrentChar() {
    if(!currentChar) {
        currentChar = 'а'
    }
    else {
        currentChar = String.fromCharCode(currentChar.charCodeAt(0) + 1);
    }
}

function loadContent(onComplete) {
    var url = "HTMLff.htm"
    var tmpDOM = document.createElement("div")
    $(tmpDOM).load(url, function() {
        originalContent = document.createElement("div")
        $(tmpDOM).children("div").each(function(index, element) {
            originalContent.appendChild(element.cloneNode(true))
            tmpDOM.removeChild(element)
        })
        removeJunk(originalContent)
        $(tmpDOM).children().each(function(index, element) {
            document.head.appendChild(element.cloneNode(true))
        })
        $(contentHolder).empty()
        contentHolder.appendChild(originalContent.cloneNode(true))
        onComplete()
    })
}

function removeJunk(node, isContentChild = false) {
    var isContent = $(node).attr("id") == "mw-content-text"
    var isContentParent = false
    $(node).children().each(function(index, element) {
        isContentParent = removeJunk(element, isContentChild || isContent) || isContentParent
    })
    if(!isContent && !isContentChild && !isContentParent) {
        node.remove()
    }
    return isContentParent || isContent
}

function handleContent() {
    //перезапись контента
    $(contentHolder).empty()
    contentHolder.appendChild(originalContent.cloneNode(true))
    var charsCount = parseInt($('#charsCount').val())
    console.log('now i will remove char '+currentChar+" and crap up to "+charsCount+" symbols")
    dfsOverDOM(contentHolder, charsCount)
}

function dfsOverDOM(node, leftChars) {
	for (var i = 0; i < node.childNodes.length; ++i) {
		leftChars = dfsOverDOM(node.childNodes[i], leftChars);
	}
	if(node.nodeName == "#text" && node.textContent) {
        var str = node.textContent
        if(leftChars <= 0) {
            str = '';
        }
        else if(leftChars < str.length) {
            str = str.substring(0, leftChars);
            leftChars = 0;
        }
        else {
            leftChars = leftChars - str.length;
        }
        //str = str.replace(new RegExp(' ', 'gi'), '*')
        node.textContent = str.replace(new RegExp(currentChar, 'gi'), '')
	}
    return leftChars
}
