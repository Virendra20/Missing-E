/*
 * 'Missing e' Extension
 *
 * Copyright 2011, Jeremy Cutler
 * Released under the GPL version 3 licence.
 * SEE: license/GPL-LICENSE.txt
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

(function($){

MissingE.packages.dashboardTweaks = {

   setupMassDeletePost: function(item) {
      $('<span />', {"class": "MissingEmassDeleteSpan"})
         .append($('<input />',
                   {type: "checkbox",
                    val: "0",
                    id: item.id + "_select",
                    "class": "MissingEmassDeleteSelect"}))
         .appendTo($(item).find('div.post_controls'));
   },

   deletePosts: function(key, lang) {
      var posts = [];
      var count = 0;
      var set = $('#posts li.MissingEmdSelected');
      if (set.length < 1) { return; }
      var remset = set.filter(function() {
         if (count >= 100) { return false; }
         count++;
         return true;
      }).each(function(i) {
         if (i >= 100) { return false; }
         posts.push(this.id.match(/\d+$/)[0]);
      });
      $.ajax({
         type: "POST",
         url: '/delete_posts',
         data: {"post_ids": posts.join(','),
                "form_key": key},
         error: function() {
            alert(MissingE.getLocale(lang).massDelete.postsError);
         },
         success: function() {
            remset.removeClass('MissingEmdSelected').remove();
            MissingE.packages.dashboardTweaks.deletePosts(key, lang);
         }
      });
   },

   addPostLinks: function() {
      var i;
      var plbody = $('<div class="short_post_labels" />');
      var lang = $('html').attr('lang');
      for (i in MissingE.getLocale(lang).postTypeNames) {
         if (MissingE.getLocale(lang).postTypeNames.hasOwnProperty(i)) {
            var plitem = $('<a />',
                           {"class": "new_post_label", href: "/new/" + i,
                            text: MissingE.getLocale(lang).postTypeNames[i]});
            plbody.append($('<div class="short_label" />').append(plitem));
         }
      }
      plbody.append($('<div class="clear" />'));

      var npl = $('<li />', {"class": "short_new_post post new_post",
                             id: "new_post"}).prependTo('#posts');
      npl.append(plbody);
      var bg = npl.css('background-image');
      var bgc = npl.css('background-color');
      npl.css('cssText','background-image:none !important;' +
                        'background-color:' +
                        ((!bg || bg === 'none') ? 'transparent' : bgc) +
                        ' !important;');
   },

   doReplies: function(item) {
      var node = $(item);
      if (item.tagName !== 'LI' ||
          !(node.hasClass('post')) ||
          !(node.hasClass('is_reblog')) ||
          node.hasClass('is_mine') ||
          node.find('.post_controls a[id^="post_control_reply"]').length > 0 ||
          node.find('.MissingE_experimental_reply').length > 0) {
         return;
      }
      var lang = $('html').attr('lang');
      var id = node.attr('id').match(/\d*$/)[0];
      var notes = $('#show_notes_link_' + id);
      if (notes.length === 0) {
         return false;
      }
      var key = notes.parent().html()
                     .match(/display_post_notes\(\d+,\s*'(\w+)'/);
      if (!key) {
         return false;
      }
      key = MissingE.escapeHTML(key[1]);
      id = MissingE.escapeHTML(id);
      notes.after($('<a />',
                    {"class": "MissingE_experimental_reply",
                     href: "#",
                     click: function(){
                        $.globalEval('display_reply_pane([' + id + ',"' +
                                                          key + '"]);');
                        return false;
                     },
                     id: "post_control_reply_" + id,
                     title: MissingE.getLocale(lang).dashTweaksText.reply +
                        " [" + MissingE.getLocale(lang).dashTweaksText.experimental + "]",
                     text: "[" + MissingE.getLocale(lang).dashTweaksText.reply + "]"}));

      notes.after($('<span />',
                    {"class": "MissingE_post_control " +
                            "MissingE_experimental_reply_wait",
                     id: "reply_fail_" + id}));
   },

   realignReplyNipple: function(nip) {
      if ($(nip).attr('in_final_position') !== 'true') {
         setTimeout(function() {
            MissingE.packages.dashboardTweaks.realignReplyNipple(nip);
         }, 500);
         return false;
      }
      var right = $(nip).offsetParent().innerWidth() -
                  $(nip).position().left - $(nip).width();
      $(nip).css({left:'auto', right:right+'px'});
   },

   addExpandAllHandler: function(item) {
      var post = $(item);
      if (item.tagName !== 'LI' || !post.hasClass('post')) {
         return false;
      }
      post.find('.inline_image,.inline_external_image').click(function() {
         var me = this;
         if (!$(this).hasClass('exp_inline_image')) {
            $(this).closest('.post').find('.inline_image')
               .addClass('exp_inline_image').removeClass('inline_image');
            $(this).closest('.post').find('.inline_external_image')
                  .each(function() {
               if (this === me) { return; }
               var x = this;
               var imgsrc = $(this).attr('onclick').match(/this,'([^']*)'/)[1];
               if (!$(this).hasClass('enlarged')) {
                  $(this).attr('original_src',this.src);
                  $(this).addClass('enlarged');
                  if (this.hasAttribute('loader')) {
                     this.src = $(this).attr('loader');
                  }
                  var img = new Image();
                  img.onload = function() {
                     x.src = imgsrc;
                  };
                  img.src = imgsrc;
               }
               $(this).addClass('exp_inline_image');
            });
            $(this).addClass('exp_inline_image');
            if (!$(this).hasClass('inline_external_image')) {
               $(this).removeClass('inline_image');
            }
         }
         else {
            $(this).closest('.post').find('.exp_inline_image').each(function() {
               $(this).removeClass('exp_inline_image');
               if (!$(this).hasClass('inline_external_image')) {
                  $(this).addClass('inline_image');
               }
               else {
                  if (this === me) { return; }
                  if ($(this).hasClass('enlarged')) {
                     this.src = $(this).attr('original_src');
                     $(this).removeClass('enlarged');
                  }
               }
            });
         }
      });
   },

   styleSorters: function(sorters, order) {
      var buttons = sorters.find(".MissingE_sorterButton");
      if (!order || order === "") {
         buttons.css('opacity','').removeClass("MissingE_descSort");
         var firstBtn = sorters.find(".MissingE_sorterButton:first");
         if (firstBtn.hasClass('MissingE_userSort')) {
            firstBtn.detach()
               .appendTo(sorters.find(".MissingE_sorterContainer"));
         }
      }
      else {
         buttons.css('opacity','1');
         sorters.find(".MissingE_typeSort")
            .toggleClass("MissingE_descSort", /t/.test(order));
         sorters.find(".MissingE_userSort")
            .toggleClass("MissingE_descSort", /u/.test(order));
      }
   },

   unsortList: function(ol) {
      var notes = $(ol);
      var arr = [];
      var list = notes.find('li.MissingE_sortedNote');
      list.each(function() {
         arr[$(this).attr('index')] = this;
      });
      list.detach();
      notes.prepend($(arr));
   },

   sortList: function(ol) {
      var ANSWER=0, REPLY=1, PHOTO=2, REBLOG_COMMENTARY=3,
          REBLOG=4, LIKE=5, OTHER=6;
      var didReverse = false;
      var notes = $(ol);
      var sortorder = notes.data('sortorder');
      if (!sortorder || sortorder === "" ||
          !(/^([tT][uU]|[uU][tT])$/.test(sortorder))) {
         return;
      }
      sortorder = sortorder.split('');
      var arr = [], entryOrder = {}, i;
      var sorted = [];
      var list = notes.find('li.MissingE_sortedNote');
      if (sortorder[0] === "T" || sortorder[0] === "t") {
         entryOrder = {"type":0,"user":1};
      }
      else {
         entryOrder = {"type":1,"user":0};
      }
      list.each(function() {
         var entry = [];
         if ($(this).hasClass('answer')) {
            entry[entryOrder.type] = ANSWER;
         }
         else if ($(this).hasClass('photo')) {
            entry[entryOrder.type] = PHOTO;
         }
         else if ($(this).hasClass('reply')) {
            entry[entryOrder.type] = REPLY;
         }
         else if ($(this).hasClass('reblog')) {
            if ($(this).hasClass('with_commentary')) {
               entry[entryOrder.type] = REBLOG_COMMENTARY;
            }
            else {
               entry[entryOrder.type] = REBLOG;
            }
         }
         else if ($(this).hasClass('like')) {
            entry[entryOrder.type] = LIKE;
         }
         else {
            entry[entryOrder.type] = OTHER;
         }
         var username = this.className.match(/(tumblelog|blog)_([^\s]*)/);
         if (username && username.length > 2) {
            entry[entryOrder.user] = username[2];
         }
         else {
            entry[entryOrder.user] = "";
         }
         entry[2] = this;
         arr.push(entry);
      });
      arr.sort();
      if (/[ut]/.test(sortorder[0])) {
         arr.reverse();
         didReverse = true;
      }
      if ((/[ut]/.test(sortorder[1]) && !didReverse) ||
          (/[UT]/.test(sortorder[1]) && didReverse)) {
         var cType = arr.length > 0 ? arr[0][0] : 0;
         var mid = [];
         for (i=0; i<arr.length; i++) {
            if (arr[i][0] === cType) {
               mid.unshift(arr[i][2]);
            }
            else {
               cType = arr[i][0];
               sorted = sorted.concat(mid);
               mid = [arr[i][2]];
            }
         }
         sorted = sorted.concat(mid);
      }
      else {
         for (i=0; i<arr.length; i++) {
            sorted[i] = arr[i][2];
         }
      }
      list.detach();
      notes.prepend($(sorted));
   },

   videoThumbnailCycle: function() {
      var preWin = $('#MissingE_preview');
      if (!preWin.is('.MissingE_videoPreview:visible') ||
          preWin.find('img.MissingE_videoThumb').length <= 1) {
         return;
      }
      var currThumb = preWin.find('img.MissingE_visibleThumb');
      if (currThumb.next().length > 0) {
         currThumb.next('.MissingE_videoThumb:first')
            .addClass('MissingE_visibleThumb');
      }
      else {
         preWin.find('img.MissingE_videoThumb:first')
            .addClass('MissingE_visibleThumb');
      }
      currThumb.removeClass('MissingE_visibleThumb');
   },

   receivePreview: function(response) {
      var preWin = $('#MissingE_preview');
      if (preWin.length === 0) {
         return;
      }
      if (response.success) {
         if (MissingE.packages.dashboardTweaks.videoThumbnailCycleId) {
            window.clearInterval(MissingE.packages.dashboardTweaks
                                    .videoThumbnailCycleId);
         }
         if (preWin.attr('post') === response.pid) {
            var i, limit = 2;
            if (response.type === "video") {
               preWin.addClass("MissingE_videoPreview");
               MissingE.packages.dashboardTweaks.videoThumbnailCycleId =
                  window.setInterval(MissingE.packages.dashboardTweaks
                                       .videoThumbnailCycle, 600);
               limit = response.data.length;
            }
            for (i=0; i<limit && i<response.data.length; i++) {
               var prevImg = document.createElement('img');
               prevImg.setAttribute('post', response.pid);
               if (response.type === "video") {
                  var klass = "MissingE_videoThumb";
                  if (i==0) { klass += " MissingE_visibleThumb"; }
                  prevImg.className = klass;
               }
               prevImg.style.display = "none";
               preWin.append(prevImg);
               prevImg.onload = function() {
                  if (preWin.attr('post') !== this.getAttribute('post')) {
                     return;
                  }
                  $('#MissingE_preview')
                     .removeClass('MissingE_preview_loading');
                  this.style.display = "inline";
               };
               if (response.type === "photo") {
                  prevImg.src = response.data[i]
                                    .replace(/\d*\.([a-z]+)$/,"100.$1");
               }
               else {
                  prevImg.src = response.data[i];
               }
            }
         }
      }
      else {
         preWin.removeAttr('post').removeClass('MissingE_preview_loading')
            .addClass('MissingE_preview_fail');
      }
   },

   run: function() {
      var settings = this.settings
      var lang = $('html').attr('lang');

      extension.addAjaxListener(function(type,list) {
         if (type === 'notes') { return; }
         $.each(list, function (i,val) {
            var node = $('#'+val);
            if (node.get(0).tagName === 'LI' && node.hasClass('post')) {
               if ($('#posts li.post[id="' + node.attr('id') + '"]')
                     .length > 1) {
                  node.remove();
               }
            }
         });
      });
      $('#posts a.like_button').live('click', function(e) {
         e.preventDefault();
      });

      if (settings.noExpandAll === 1) {
         $('head').append('<style type="text/css">' +
                          '#posts .post img.inline_external_image_off {' +
                          'cursor:pointer; }' +
                          '#posts .post img.inline_external_image_off' +
                             '.enlarged {' +
                          'cursor:default; width:auto !important;' +
                          'height:auto !important; }');
         $('#posts .post img.inline_external_image, ' +
           '#posts .post img.toggle_inline_image').mousedown(function() {
            var me = $(this);
            var cont = me.closest('.post_content');
            cont.find('.inline_external_image')
               .removeClass('inline_external_image')
               .addClass('inline_external_image_off');
            cont.find('.toggle_inline_image')
               .removeClass('toggle_inline_image')
               .addClass('toggle_inline_image_off');
            if (me.hasClass('inline_external_image_off')) {
               me.removeClass('inline_external_image_off')
                  .addClass('inline_external_image');
            }
            if (me.hasClass('toggle_inline_image_off')) {
               me.removeClass('toggle_inline_image_off')
                  .addClass('toggle_inline_image');
            }
         });
      }

      if (settings.widescreen === 1 &&
          !MissingE.isTumblrURL(location.href, ["settings"])) {
         var w = $('#right_column').width() + 20;
         $('head').append('<style type="text/css">' +
                          '#pagination { margin-right:-' + w + 'px; } ' +
                          '#content .tag_page_header { padding-right:' +
                          (w+40) + 'px; }</style>');
         $('#content').css('padding-right', (w+20) + 'px');
         $('#left_column').css('min-height',
                               $('#right_column').height() + 'px');
         extension.addAjaxListener(function(type,list) {
            if (type === 'notes') { return; }
            $.each(list, function(i,val) {
               $('#'+val).children('div.reply_pane:first')
                     .each(function() {
                  MissingE.packages.dashboardTweaks
                        .realignReplyNipple($(this).find('div.nipple'));
               });
            });
         });
      }
      if (settings.postLinks === 1 &&
          MissingE.isTumblrURL(location.href, ["dashboardOnly"]) &&
          $('#new_post').length === 0) {
         MissingE.packages.dashboardTweaks.addPostLinks();
      }

      if (settings.reblogReplies === 1 &&
          document.body.id !== "tinymce" &&
          document.body.id !== "dashboard_edit_post") {

         $('head').append('<script type="text/javascript">' +
         'Ajax.Responders.register({' +
            'onCreate: function(request) {' +
               'var fail;' +
               'if (request.url === "/reply") {' +
                  'if ((fail = document.getElementById(\'reply_fail_\' + request.parameters.post_id))) {' +
                     'fail.className="MissingE_post_control MissingE_experimental_reply_wait";' +
                  '}' +
               '}' +
            '},' +
            'onComplete: function(response) {' +
               'var fail;' +
               'if (response.url === "/reply") {' +
                  'if ((fail = document.getElementById(\'reply_fail_\' + response.parameters.post_id))) {' +
                     'if (response.transport.status == 200) {' +
                        'fail.className="MissingE_post_control MissingE_experimental_reply_success";' +
                     '}' +
                     'else {' +
                        'fail.className="MissingE_post_control MissingE_experimental_reply_fail";' +
                     '}' +
                  '}' +
               '}' +
            '}' +
         '});' +
         '</script>');

         extension.addAjaxListener(function(type,list) {
            if (type === 'notes') { return; }
            $.each(list, function (i, val) {
               MissingE.packages.dashboardTweaks.doReplies($('#'+val).get(0));
            });
         });
         $('#posts li.post').each(function() {
            MissingE.packages.dashboardTweaks.doReplies(this);
         });
      }

      if (settings.replaceIcons === 1 &&
          document.body.id !== "tinymce" &&
          document.body.id !== "dashboard_edit_post") {

         if (lang === "es" || lang === "ru" || lang === "pl") {
            $('#posts .post .post_controls a[id^="show_notes_"] span')
                  .text(function(i,txt) {
               return txt.replace(/(\d)\s+(\d)/,'$1,$2');
            });
            extension.addAjaxListener(function(type, list) {
               if (type === 'notes') { return; }
               $.each(list, function(i,val) {
                  $('#'+val+' .post_controls a[id^="show_notes_"] span')
                        .text(function(i,txt) {
                     return txt.replace(/(\d)\s+(\d)/,'$1,$2');
                  });
               });
            });
         }

         $('#posts .post .post_controls a').live('mouseover', function() {
            var item = $(this);
            if (item.attr('title')) { return; }
            if (!MissingE.isTumblrURL(location.href, ["messages"]) &&
                (/delete_post_/.test(item.attr('onclick')) ||
                 /^post_delete_/.test(item.attr('id')) ||
                 (new RegExp(MissingE.getLocale(lang).dashTweaksText.del, "i")
                  .test(item.text())))) {
               item.attr('title', MissingE.getLocale(lang).dashTweaksText.del);
            }
            else if (/queue_post_/.test(item.attr('onclick')) ||
                     (new RegExp(MissingE.getLocale(lang).dashTweaksText.queue,
                                 "i")).test(item.text())) {
               item.attr('title', MissingE.getLocale(lang)
                                    .dashTweaksText.queue);
            }
            else if (/^\/edit/.test(item.attr('href'))) {
               item.attr('title', MissingE.getLocale(lang).dashTweaksText
                                    .edit);
            }
            else if (/^\/reblog/.test(item.attr('href')) ||
                     /http[s]?:\/\/www\.tumblr\.com\/register\?referer=soft_reblog/
                        .test(item.attr('href'))) {
               item.attr('title', MissingE.getLocale(lang).dashTweaksText
                                    .reblog);
            }
            else if (/^ask_answer_link_/.test(item.attr('id'))) {
               item.attr('title', MissingE.getLocale(lang).dashTweaksText
                                    .answer);
            }
            else if (/^post_control_reply_/.test(item.attr('id'))) {
               item.attr('title',
                         MissingE.getLocale(lang).dashTweaksText.reply +
                         (item.hasClass("MissingE_experimental_reply") ?
                          " [" + MissingE.getLocale(lang).dashTweaksText
                                    .experimental + "]" : ""));
            }
            else if (/^show_notes_/.test(item.attr('id')) &&
                     item.children().length === 0) {
               item.attr('title', MissingE.getLocale(lang).dashTweaksText
                                    .notes);
            }
            else if (item.hasClass('reblog_count')) {
               item.attr('title', MissingE.getLocale(lang).dashTweaksText
                                    .notes);
            }
         });
      }

      if ((settings.massDelete === 1 &&
           MissingE.isTumblrURL(location.href, ["drafts", "queue"])) ||
          (settings.randomQueue === 1 &&
           MissingE.isTumblrURL(location.href, ["queue"]))) {
         var doMassDelete = settings.massDelete === 1 &&
            MissingE.isTumblrURL(location.href, ["drafts", "queue"]);
         var doRandomQueue = settings.randomQueue === 1 &&
            MissingE.isTumblrURL(location.href, ["queue"]);
         var afterguy = $('#right_column a.settings');
         var beforeguy;
         if (afterguy.length > 0) {
            beforeguy = afterguy.closest('ul').next();
         }
         else {
            beforeguy = $('#right_column a.posts').closest('ul');
            if (beforeguy.length === 0) {
               beforeguy = $('#search_form');
            }
         }
         $('head').append('<style type="text/css">' +
                 '#right_column #MissingEdraftQueueTools a { ' +
                 'background-image:url("' +
                 extension.getURL("core/dashboardTweaks/draftQueueTools.png") +
                 '") !important; }</style>');
         var btns = $('<ul />', {"class": "controls_section",
                                 id: "MissingEdraftQueueTools"});

         if (doRandomQueue) {
            btns.append($('<li />')
                           .append($('<a />',
                                     {href: "#", "class": "randomize"})
                                       .append($('<div />',
                                                 {"class": "hide_overflow",
                                                  text: MissingE.getLocale(lang).shuffle}))));
         }
         if (doMassDelete) {
            btns.append($('<li />')
                           .append($('<a />',
                                     {href: "#", "class": "select_all"})
                                       .append($('<div />',
                                                 {"class": "hide_overflow",
                                                  text: MissingE.getLocale(lang).massDelete.selectAll}))));
            btns.append($('<li />')
                           .append($('<a />',
                                     {href: "#", "class": "deselect_all"})
                                       .append($('<div />',
                                                 {"class": "hide_overflow",
                                                  text: MissingE.getLocale(lang).massDelete.deselectAll}))));
            btns.append($('<li />')
                           .append($('<a />',
                                     {href: "#", "class": "delete_selected"})
                                       .append($('<div />',
                                                 {"class": "hide_overflow",
                                                  text: MissingE.getLocale(lang).massDelete.deleteSelected}))));
         }
         btns.insertBefore(beforeguy);

         if (doMassDelete) {
            $('#posts li.post').each(function() {
               MissingE.packages.dashboardTweaks.setupMassDeletePost(this);
            });
            extension.addAjaxListener(function(type,list) {
               if (type === 'notes') { return; }
               $.each(list, function(i, val) {
                  MissingE.packages.dashboardTweaks
                     .setupMassDeletePost($('#'+val).get(0));
               });
            });
         }
         $('.move_to_top').live('click', function() {
            if ($('#posts li:first').attr('id') === "new_post" &&
                $('#posts li.post').length > 1) {
               $('#posts').find('li[id^="photo_reply_container"]').detach()
                  .insertAfter('#posts li.post:not(#new_post):first');
            }
         });
         $('#MissingEdraftQueueTools a').click(function() {
            var btn = $(this);
            if (btn.hasClass('randomize')) {
               var arr = [];
               $('#posts li.queued').each(function() {
                  arr.push(this.id.match(/\d*$/)[0]);
               });
               arr.shuffle();
               $('head').append('<script type="text/javascript">' +
                  'Sortable.setSequence("posts",["' + arr.join('","') + '"]);' +
                  'update_publish_on_times();</script>');
               if ($('#posts li:first').attr('id') === "new_post" &&
                   $('#posts li.post').length > 1) {
                  $('#posts').find('li[id^="photo_reply_container"]').detach()
                     .insertAfter('#posts li.post:not(#new_post):first');
               }
            }
            else if (btn.hasClass('select_all')) {
               $('#posts input.MissingEmassDeleteSelect').each(function() {
                  this.checked = true;
                  $(this).trigger('change');
               });
            }
            else if (btn.hasClass('deselect_all')) {
               $('#posts input.MissingEmassDeleteSelect').each(function() {
                  this.checked = false;
                  $(this).closest('li.post').removeClass('MissingEmdSelected');
               });
            }
            else if (btn.hasClass('delete_selected')) {
               var key = $('#posts input[name="form_key"]:first').val();
               var count = $('#posts li.MissingEmdSelected').length;
               if (count > 0) {
                  var sureMsg = MissingE.getLocale(lang).massDelete.postsConfirm
                                    .replace('#',count);
                  if (MissingE.getLocale(lang).massDelete.confirmReplace) {
                     var countOp = count;
                     switch(MissingE.getLocale(lang).massDelete
                              .confirmReplace.operation[0]) {
                        case "+":
                           countOp += MissingE.getLocale(lang).massDelete
                                       .confirmReplace.operation[1];
                           break;
                        case "-":
                           countOp -= MissingE.getLocale(lang).massDelete
                                       .confirmReplace.operation[1];
                           break;
                        case "%":
                           countOp %= MissingE.getLocale(lang).massDelete
                                       .confirmReplace.operation[1];
                           break;
                     }
                     if (MissingE.getLocale(lang).massDelete
                           .confirmReplace[countOp]) {
                        var r;
                        var repls = MissingE.getLocale(lang).massDelete
                                       .confirmReplace[countOp];
                        for (r in repls) {
                           if (repls.hasOwnProperty(r)) {
                              sureMsg = sureMsg.replace(r,repls[r]);
                           }
                        }
                     }
                  }
                  var sure = confirm(sureMsg);
                  if (sure) {
                     MissingE.packages.dashboardTweaks.deletePosts(key, lang);
                  }
               }
            }
            return false;
         });
         $('input.MissingEmassDeleteSelect').live('change', function() {
            var item = $(this).closest('li.post');
            if (this.checked) {
               item.addClass('MissingEmdSelected');
            }
            else {
               item.removeClass('MissingEmdSelected');
            }
         });
      }

      if (settings.sortableNotes === 1) {
         extension.addAjaxListener(function(type,thelist) {
            if (type !== 'notes') { return; }
            var container = $('#' + thelist[0]);
            var div = container.find('#' + thelist[0]
                                     .replace(/post/,"notes_container"));
            div.prepend('<div class="MissingE_notesSorter">' +
                     MissingE.escapeHTML(MissingE.getLocale(lang)
                                          .sorting.sort) + ': ' +
                     '<div class="MissingE_sorterContainer">' +
                     '<div class="MissingE_sorterButton MissingE_typeSort">' +
                     MissingE.escapeHTML(MissingE.getLocale(lang)
                                          .sorting.type) + ' ' +
                     '<span class="MissingE_upArrow">&uArr;</span>' +
                     '<span class="MissingE_downArrow">&dArr;</span>' +
                     '</div>' +
                     '<div class="MissingE_sorterButton MissingE_userSort">' +
                     MissingE.escapeHTML(MissingE.getLocale(lang)
                                          .sorting.user) + ' ' +
                     '<span class="MissingE_upArrow">&uArr;</span>' +
                     '<span class="MissingE_downArrow">&dArr;</span>' +
                     '</div></div>' +
                     '<div class="MissingE_sorterButton MissingE_unsort">' +
                      MissingE.escapeHTML(MissingE.getLocale(lang)
                                             .sorting.reset) +
                     '</div></div>');
            var node = container.find('ol.notes');
            var list = node.find('li').not('.more_notes_link_container');
            list.each(function(i) {
               $(this).attr('index',i).addClass('MissingE_sortedNote');
            });
            node.data('length',list.length);
            $(div).find(".MissingE_sorterContainer").sortable({
               items: "div",
               cursor: "move",
               axis: "x",
               opacity: 0.6,
               placeholder: 'MissingE_sorterPlaceholder',
               forcePlaceholderSize: true,
               update: function() {
                  var item = $(this);
                  var ol = item.closest("li.post").find('ol.notes');
                  var sortorder = ol.data('sortorder');
                  var newsortorder = sortorder;
                  if (!sortorder || sortorder === "" ||
                      !(/^([tT][uU]|[uU][tT])$/.test(sortorder))) {
                     sortorder = 'TU';
                  }
                  if (item.find('.MissingE_sorterButton:first')
                      .hasClass('MissingE_typeSort')) {
                     newsortorder = sortorder.match(/[tT]/)[0] +
                                    sortorder.match(/[uU]/)[0];
                  }
                  else {
                     newsortorder = sortorder.match(/[uU]/)[0] +
                                    sortorder.match(/[tT]/)[0];
                  }
                  if (newsortorder !== sortorder) {
                     ol.data('sortorder',newsortorder);
                     MissingE.packages.dashboardTweaks.styleSorters($(this)
                                         .closest('div.MissingE_notesSorter'),
                                         newsortorder);
                     MissingE.packages.dashboardTweaks.sortList(ol);
                  }
               }
            });
         });

         $('#posts ol.notes').live('mouseover', function() {
            var startIndex = $(this).data('length');
            var list = $(this).find('li:not(.MissingE_sortedNote)')
                           .not('.more_notes_link_container');
            if (list.length > 0) {
               list.each(function(i) {
                  $(this).attr('index',startIndex + i)
                     .addClass('MissingE_sortedNote');
               });
               $(this).data('length',startIndex + list.length);
               MissingE.packages.dashboardTweaks.sortList(this);
            }
         });

         $('#posts .MissingE_sorterButton').live('click', function() {
            var item = $(this);
            var ol = item.closest("li.post").find('ol.notes');
            var sortorder = ol.data('sortorder');
            if (item.hasClass('MissingE_unsort')) {
               if (sortorder && sortorder !== "") {
                  ol.data('sortorder','');
                  MissingE.packages.dashboardTweaks
                     .styleSorters($(this).parent(),'');
                  MissingE.packages.dashboardTweaks.unsortList(ol);
               }
            }
            else {
               var m;
               var newsortorder = sortorder;
               if (!sortorder || sortorder === "" ||
                   !(/^([tT][uU]|[uU][tT])$/.test(sortorder))) {
                  newsortorder = 'TU';
               }
               else if (item.hasClass('MissingE_typeSort')) {
                  m = sortorder.match(/.*([tT]).*/);
                  newsortorder = m[0].replace(/[tT]/,m[1] === "t" ? "T" : "t");
               }
               else if (item.hasClass('MissingE_userSort')) {
                  m = sortorder.match(/.*([uU]).*/);
                  newsortorder = m[0].replace(/[uU]/,m[1] === "u" ? "U" : "u");
               }
               if (newsortorder !== sortorder) {
                  ol.data('sortorder',newsortorder);
                  MissingE.packages.dashboardTweaks
                     .styleSorters($(this).closest('div.MissingE_notesSorter'),
                                   newsortorder);
                  MissingE.packages.dashboardTweaks.sortList(ol);
               }
            }
         });
      }

      if (settings.notePreview === 1) {
         $('body').append($('<div />', { id: "MissingE_preview" }));
         var len = MissingE.getLocale(lang).posts.photo.length;
         $('#posts li.notification .hide_overflow > a')
               .live('mouseover', function() {
            var item = $(this);
            var text = item.text();
            var type;
            var tid = this.href.match(/^(http[s]?:\/\/[^\/]*)\/post\/(\d+)/);
            if (!tid || tid.length < 3) { return; }
            var url = tid[1];
            tid = tid[2];
            var preWin = $('#MissingE_preview');
            if (preWin.attr('post') !== tid &&
                (text === MissingE.getLocale(lang).posts.photo[len-1] ||
                 text === MissingE.getLocale(lang).posts.photoset[len-1] ||
                 text === MissingE.getLocale(lang).posts.video[len-1])) {
               preWin.attr('post',tid);
               preWin.empty()
                  .removeClass('MissingE_videoPreview MissingE_preview_fail')
                  .addClass('MissingE_preview_loading');
               var exPhotoset = $('#photoset_' + tid);
               var exPost = $('#post_' + tid);
               if (exPost.hasClass("photo")) { type = "photo"; }
               else if (exPost.hasClass("video")) { type = "video"; }
               if (exPhotoset.length > 0) {
                  var exImgs = [];
                  exPhotoset.find('img').each(function() {
                     exImgs.push(this.src.replace(/http:\/\/\d+\./,'http://'));
                  });
                  MissingE.packages.dashboardTweaks
                     .receivePreview({success: true, pid: tid, data: exImgs,
                                      type: "photo"});
               }
               else if (exPost.length > 0 &&
                        type === 'photo') {
                  var exImg = exPost.find('div.post_content img:first')
                                 .attr('src');
                  exImg = exImg.replace(/http:\/\/\d+\./,'http://');
                  MissingE.packages.dashboardTweaks
                     .receivePreview({success: true, pid: tid, data: [exImg],
                                      type: "photo"});
               }
               else if (false && exPost.length > 0 &&
                        type === 'video') {
                  var screenshots;
                  var exSS = exPost.find('#video_thumbnail_' + tid);
                  var embedSS = exPost.find('#video_player_' + tid + ' embed');
                  if (exSS.length > 0 && exSS.attr('thumbnails')) {
                     screenshots = exSS.attr('thumbnails')
                                       .replace(/\s*\|\s*/g,'|').split('|');
                  }
                  else if (exSS.length > 0) {
                     screenshots = [exSS.attr('src')];
                  }
                  else if (embedSS.length > 0) {
                     var flashVars = embedSS.attr('flashvars');
                     if (flashVars) {
                        var posters = flashVars.match(/poster=(http[^'"\(\)&]*)/);
                        if (posters && posters.length > 0) {
                           screenshots = posters[1].replace(/%3A/gi,':')
                                                   .replace(/%2F/gi,'/')
                                                   .split(',');
                        }
                     }
                  }
                  if (!screenshots || screenshots.length === 0) {
                     screenshots =
                        [extension.getURL('core/dashboardTweaks/black.png')];
                  }
                  if (screenshots.length === 1 &&
                      /black_100\.png$/.test(screenshots[0])) {
                     extension.sendRequest("preview",
                            {pid: tid, url: url, type: type},
                            MissingE.packages.dashboardTweaks.receivePreview);
                  }
                  else {
                     MissingE.packages.dashboardTweaks
                        .receivePreview({success: true, pid: tid,
                                         data: screenshots, type: type});
                  }
               }
               else {
                  extension.sendRequest("preview",
                            {pid: tid, url: url, type: type},
                            MissingE.packages.dashboardTweaks.receivePreview);
               }
            }
            else if (preWin.attr('post') !== tid) {
               return;
            }
            var offset = item.offset();
            var x = offset.left + (item.width() >> 1) - 50;
            var y = offset.top + item.height();
            preWin.css({
               'display': 'block',
               'left': x + 'px',
               'top': y + 'px'
            });
         });
         $('#posts li.notification .hide_overflow > a')
               .live('mouseout', function() {
            $('#MissingE_preview').hide();
         });
      }
   },

   init: function() {
      extension.sendRequest("settings", {component: "dashboardTweaks"},
                            function(response) {
         if (response.component === "dashboardTweaks") {
            var i;
            MissingE.packages.dashboardTweaks.settings = {};
            for (i in response) {
               if (response.hasOwnProperty(i) &&
                   i !== "component") {
                  MissingE.packages.dashboardTweaks.settings[i] = response[i];
               }
            }
            MissingE.packages.dashboardTweaks.run();
         }
      });
   }
};

if (extension.isChrome ||
    extension.isFirefox) {
   MissingE.packages.dashboardTweaks.init();
}

}(jQuery));
