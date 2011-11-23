/*
 * 'Missing e' Extension
 *
 * Copyright 2011, Jeremy Cutler
 * Released under the GPL version 3 licence.
 * SEE: GPL-LICENSE.txt
 *
 * This file is part of 'Missing e'.
 *
 * 'Missing e' is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * 'Missing e' is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with 'Missing e'. If not, see <http://www.gnu.org/licenses/>.
 */

/*global $ */

function checkAjaxReady(data, tries) {
   if (data.list.length === 0 || $('#'+data.list[0]).length > 0) {
      var evt = document.createEvent("MessageEvent");
      evt.initMessageEvent("MissingEajax", true, true,
                           {"type":data.type, "list":data.list},
                           "http://www.tumblr.com", 0, window);
      document.dispatchEvent(evt);
   }
   else if (tries < 10) {
      setTimeout(function(){checkAjaxReady(data,tries+1);},500);
   }
}

if (location.host === 'www.tumblr.com') {
   $('head').append('<script type="text/javascript">\
      Ajax.Responders.register({ \
         onException: function(request, ex) { \
            this.onComplete(request); \
         }, \
         onComplete: function(request) { \
            if (request.transport.status === 200) { \
               var type, newPosts; \
               if (/^(http:\\/\\/www\\.tumblr\\.com)?\\/((dashboard\\/((\\d+\\/\\d+)|(search\\/[^\\/]+\\/\\d+)))|(blog\\/[^\\/]+\\/((\\d+)|(search\\/[^\\/]*\\/\\d+))))/.test(request.url)) { \
                  type = "posts"; \
               } \
               else if (/^(http:\\/\\/www\\.tumblr\\.com)?\\/((inbox\\/after\\/\\d+)|((blog\\/[^\\/]+\\/)?messages\\/page\\/\\d+))/.test(request.url)) { \
                  type = "messages"; \
               } \
               else if (/^(http:\\/\\/www\\.tumblr\\.com)?\\/(blog\\/[^\\/]+\\/)?drafts\\/after\\/\\d+/.test(request.url)) { \
                  type = "drafts"; \
               } \
               else if (/^(http:\\/\\/www\\.tumblr\\.com)?\\/(blog\\/[^\\/]+\\/)?queue\\?page=\\d+/.test(request.url)) { \
                  type = "queue"; \
               } \
               else if (/^(http:\\/\\/www\\.tumblr\\.com)?\\/tagged\\/[^\\?]+\\?before=\\d*/.test(request.url)) { \
                  type = "tagged"; \
               } \
               else if (/^(http:\\/\\/www\\.tumblr\\.com)?\\/mega-editor\\/[^\\/]+\\?before_time=\\d*/.test(request.url)) { \
                  type = "mass-editor"; \
               } \
               else if (/^(http:\\/\\/www\\.tumblr\\.com)?\\/dashboard\\/notes\\/\\d+\\//.test(request.url)) { \
                  type = "notes"; \
                  newPosts = ["post_" + request.url.match(/notes\\/(\\d+)/)[1]]; \
               } \
               if (type === "mass-editor") { \
                  newPosts = request.transport.responseText.match(/<a id="(post_\\d+)/g); \
                  for (i=0; i<newPosts.length; i++) { \
                     newPosts[i] = newPosts[i].replace(/<a id="/,""); \
                  } \
               } \
               else if (type !== "notes") { \
                  newPosts = request.transport.responseText.match(/<li id="(post_\\d+)/g); \
                  for (i=0; i<newPosts.length; i++) { \
                     newPosts[i] = newPosts[i].replace(/<li id="/,""); \
                  } \
               } \
               var evt = document.createEvent("MessageEvent"); \
               evt.initMessageEvent("MissingEajaxInsert", true, true, {"type":type, "list":newPosts}, "http://www.tumblr.com", 0, window); \
               document.dispatchEvent(evt); \
            } \
         } \
      });</script>');
}

$(document).bind('MissingEajaxInsert', function(e) {
   checkAjaxReady(e.originalEvent.data, 0);
});

//$(document).bind('MissingEajax', function(e) {
//   console.log(e.originalEvent.data);
//});
