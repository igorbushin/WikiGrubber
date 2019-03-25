var originalContent
var currentChar
var contentHolder

$(document).ready(function() {
    contentHolder = document.getElementById("contentHolder")
    var charsCount = document.getElementById("charsCount");
    var fetchButton = document.getElementById('fetchButton');
    charsCount.addEventListener('keyup', function (event) {
      isValidNumber = charsCount.checkValidity();
      fetchButton.disabled = !isValidNumber
    });
})

function fetchHTML() {
    updateCurrentChar()
    if(currentChar > "я") {
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
        currentChar = "а"
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
    var nodeClass = $(node).attr("className")
    var nodeId = $(node).attr("id")
    var isContent = nodeId == "mw-content-text"
    var isContentParent = false
    var junkClasses = [
        "thumb",//дополнительное окно с информацией
        "infobox", //дополнительная информация
        "vertical-navbox", //список с доп информацией
        "mw-editsection", //ссылка "править код"
        "metadata",
        "navbox" //ссылки на доп статьи
    ]
    var junkIds = ["toc"]
    var junkTags = ["style"]
    junkClasses.forEach(function(junkClass) {
        if($(node).hasClass(junkClass)) {
            node.remove()
            return false
        }
    })
    junkIds.map(function(value) {
        if($(node).attr("id") == value) {
            node.remove()
            return false
        }
    })
    junkTags.map(function(value) {
        if(node.nodeName == value) {
            node.remove()
            return false
        }  
    })
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
    var charsCount = parseInt($("#charsCount").val())
    console.log("now i will remove char "+currentChar+" and crap up to "+charsCount+" symbols")
    var contentText = document.getElementById("mw-content-text")
    dfsOverDOM(contentText, charsCount)
}

function dfsOverDOM(node, leftChars) {
	for (var i = 0; i < node.childNodes.length; ++i) {
		leftChars = dfsOverDOM(node.childNodes[i], leftChars);
	}
    var isRootChild = $(node.parentNode).hasClass('mw-parser-output')
	if(node.nodeName == "#text" && node.textContent && !isRootChild) {
        var str = node.textContent
        if(leftChars <= 0) {
            str = "";
        }
        else if(leftChars < str.length) {
            str = str.substring(0, leftChars);
            leftChars = 0;
        }
        else {
            leftChars = leftChars - str.length;
        }
        node.textContent = str.replace(new RegExp(currentChar, "gi"), "")
	}
    return leftChars
}
