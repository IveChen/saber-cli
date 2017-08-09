let loaderUtils = require('loader-utils');
let url = require('url');
let Parser = require('fastparse');

let parser = new Parser({
    inline: {
        "<!--.*?-->": true,
        "<![CDATA[.*?]]>": true,
        "<[!\\?].*?>": true,
        "<\/[^>]+>": true,
        "<script.+?src=[^>]+?><\/script>": function (match, start, length) {
            this.results.push({
                tag: 'script',
                start: start,
                length: length,
                value: match
            })
        },
        "<link.+?href=[^>]+?\/?>": function (match, start, length) {
            this.results.push({
                tag: 'style',
                start: start,
                length: length,
                value: match
            })
        }
    },
    script: {
        "<script.+?src\\s*=(\\S+)\\s*[^>]>\\s*</script>": function () {
            this.callback(...arguments);
        }
    }
});

function spliceSlice(str, index, count, add) {
    // We cannot pass negative indexes dirrectly to the 2nd slicing operation.
    if (index < 0) {
        index = str.length + index;
        if (index < 0) {
            index = 0;
        }
    }

    return str.slice(0, index) + (add || "") + str.slice(index + count);
}

module.exports = function (content) {
    // let tags = parser.parse('inline', content, {
    //     results: []
    // }).results;
    // if (tags.length) {
    //     tags = tags.reverse();
    //     tags.forEach(function (tag) {
            // console.log(tag.value);
            // parser.parse('script', tag.value, {
            //     callback() {
            //         console.log('abc')
            //     }
            // });
            // let [ieMatch, ieVersionRules] = tag.value.match(/ie=(\d[^&\s>]*)/) || [];
            // if (ieMatch && ieVersionRules) {
            //     let [match, startVersion, flag, endVersion] = ieVersionRules.match(/(\d+)([+-]*)(\d+)*/);
            //     let ieContent = '';
            //     if (endVersion && flag === '-') {
            //         ieContent = `<!--[if (gte IE ${startVersion})&(lte IE ${endVersion})]>\n${tag.value}\n<![endif]-->`;
            //     } else if (!endVersion && flag === '+') {
            //         ieContent = `<!--[if gte IE ${startVersion}]>\n${tag.value}\n<![endif]-->`;
            //     } else if (!endVersion && flag === '-') {
            //         ieContent = `<!--[if lt IE ${startVersion}]>\n${tag.value}\n<![endif]-->`;
            //     } else if(!endVersion && !flag){
            //         ieContent = `<!--[if IE ${startVersion}]>\n${tag.value}\n<![endif]-->`;
            //     }
            //     content = spliceSlice(content,tag.start,tag.length,ieContent);
            // }
        // });
    // }
    return content;
};