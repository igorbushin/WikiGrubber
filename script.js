var originalContent
var currentChar

$(document).ready(function() {
    var charsCount = document.getElementById("charsCount");
    var fetchButton = document.getElementById('fetchButton');
    charsCount.addEventListener('keyup', function (event) {
        isValidNumber = charsCount.checkValidity();
        fetchButton.disabled = !isValidNumber
    });
    $('form').submit(false);
})

function fetchHTML() {
    updateCurrentChar()
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
    else if(currentChar >= "я") {
        return
    }
    else
    {
        currentChar = String.fromCharCode(currentChar.charCodeAt(0) + 1);
    }
}

function loadContent(onComplete) {
    //var url = "HTMLff.htm"
    var url = "https://ru.wikipedia.org/wiki/HTML"
    
    var tmpDOM = document.createElement("div")
    //$(tmpDOM).load(url, function() {
    
    doCORSRequest({
        method:"get",
        url: url,
        data: ""
    }, 
    function (result) {
        originalContent = document.createElement("div")
        $(tmpDOM).html(result)
        $(tmpDOM).children("div").each(function(index, element) {
            originalContent.appendChild(element.cloneNode(true))
            tmpDOM.removeChild(element)
        })
        removeJunk(originalContent, false)
        //копирование заголовка
        // $(tmpDOM).children().each(function(index, element) {
        //     document.head.appendChild(element.cloneNode(true))
        // })

        var contentHolder = document.getElementById("contentHolder")
        $(contentHolder).empty()
        contentHolder.appendChild(originalContent.cloneNode(true))
        onComplete()
    })
}


function doCORSRequest(options, onComplete) {
    var x = new XMLHttpRequest();
    var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
    x.open(options.method, cors_api_url + options.url);
    x.onload = x.onerror = function() {
        console.log(options.method + ' ' + options.url + '\n' + x.status + ' ' + x.statusText)
        onComplete(x.responseText || '')
    };
    if (/^POST/i.test(options.method)) {
      x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    x.send(options.data);
}

function removeJunk(node, isContentChild) {
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
        "navbox", //ссылки на доп статьи
        "cnotice-full-banner-click", //верхний банер
        "mw-jump-link" //верхняя ссылка
    ]
    var junkIds = [
        "toc", //содержание
        "top" //ссылка наверху
    ]
    var junkTags = ["style", "noscript"]
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
    if(node.nodeName == "A") {
        var span = document.createElement("span")
        span.innerHTML = node.innerHTML
        node.replaceWith(span)
    }
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
    //var contentHolder = document.getElementById("contentHolder")
    //$(contentHolder).empty()
    //contentHolder.appendChild(originalContent.cloneNode(true))
    var charsCount = parseInt($("#charsCount").val())
    //console.log("now i will remove char "+currentChar+" and crap up to "+charsCount+" symbols")
    var contentText = document.getElementById("mw-content-text")
    dfsOverDOM(contentText, charsCount)
}

function dfsOverDOM(node, leftChars) {
    for (var i = 0; i < node.childNodes.length;) {
        if(leftChars == 0) {
            node.childNodes[i].remove()
        }
        else {
            leftChars = dfsOverDOM(node.childNodes[i], leftChars);   
            i++
        }
    }
    var isRootChild = $(node.parentNode).hasClass('mw-parser-output')
    if(node.nodeName == "#text" && node.textContent && !isRootChild) {
        var str = node.textContent
        str = str.replace(new RegExp(currentChar, "gi"), "")
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
        node.textContent = str
    }
    return leftChars
}