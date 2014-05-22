bf_report_manager = function() {
	this.ERR = 'Sorry, we&rsquo;re unable to process your request at this time. Please try again later.';
	this.VOTE_UPDATED = 'Your report has been noted. Thanks for your input.';
	this.cache = {};

	this.init = function() {
		if ( typeof bf_cache != 'undefined' ) report_manager.cache = bf_cache;
		var vote_buttons = $$('a.report-button');
		vote_buttons.each( function(i) {
			var campaign_id = i.getAttribute('comment_id');
			if ( campaign_id ) {
				i.observe('click', function(e) {
					e.stop();
					//report_manager.handle_click({e: e, type: 'flag'});
					report_manager.flag_comment(e);
					return false;
				} );
			}
		});


		var vote_buttons = $$('a.not-iteresting-button');
		vote_buttons.each( function(i) {
			var campaign_id = i.getAttribute('contributionid');
			if ( campaign_id ) {
				i.observe('click', function(e) {
					e.stop();
					report_manager.handle_click({e: e, type: 'uniteresting'});
					return false;
				} );
			}
		});
		if (acl.user_can('edit_user_accounts')){
				var admin_classes = new Array('spam-admin','boring-admin','report_user-admin','not_raw-admin','toggle_raw_user-admin','edit-admin');
				for( var cli = 0; cli < admin_classes.length; cli++ ) {
					var handler = null;
					if ( admin_classes[ cli ] == 'spam-admin' ) {
						handler = function( e ) {
							e.stop();
							report_manager.handle_click({e: e, type: 'flag'});
							return false;
						}
					}
					else if ( admin_classes[ cli ] == 'boring-admin' ) {
						handler = function( e ) {
							e.stop();
							report_manager.handle_click({e: e, type: 'uniteresting'});
							return false;
						}
					}
					else if ( admin_classes[ cli ] == 'report_user-admin' ) {
						handler = function( e ) {
							e.stop();
							report_manager.handle_click({e: e, type: 'edit_user'});
							return false;
						}
					}
					else if ( admin_classes[ cli ] == 'toggle_raw_user-admin' && acl.user_can('user_moderators') ) {
						handler = function( e ) {
							e.stop();
							report_manager.handle_click({e: e, type: 'toggle_raw'});
							return false;
						}
						if ( !acl.user_can('user_moderators') ) { continue; }
					}
					else if ( admin_classes[ cli ] == 'not_raw-admin' ) {
						handler = function( e ) {
							e.stop();
							report_manager.handle_click({e: e, type: 'not_raw'});
							return false;
						}
					}
					else if ( admin_classes[ cli ] == 'edit-admin' ) {
						handler = function( e ) {
							e.stop();
							report_manager.handle_click({e: e, type: 'edit_buzz'});
							return false;
						}
					}
					var objs = $$('a.' + admin_classes[ cli ] );
					for( var obji=0; obji < objs.length; obji++ ) {
						var obj = objs[ obji ] ;
						if (handler) {
							obj.show();
							obj.observe('click', handler);
						}
					}
				}
				if ( $('quickpost-tags') && typeof bf_page != 'undefined' && bf_page=='moderation') {
					$('quickpost-tags').observe('keydown', user_post.auto_complete_special );
					$('quickpost-tags').observe('keyup', user_post.auto_complete);
					$('quickpost-tags').observe('blur', function(){
						window.setTimeout(function(){$('tag_suggestions').hide()},1000);
					});
				}
				if ($('save-edited-buzz')) {
					$('save-edited-buzz').observe('click', report_manager.save_edited_buzz);
				}
				if ($('edit_image')) {
					$('edit_image').observe('click', report_manager.edit_image);
				    user_setting = {save_image:report_manager.save_image};
				    if (typeof bf_page != 'undefined' && bf_page =='moderation')
				    parent.user_post.save_quickpost_image = function(){};
				}
		}
		if ( 'universal_dom' in window ) {
			universal_dom.assign_handler({
				bucket:'show-badges',
				event:'click',
				handler:report_manager.show_badges
			});
		}
	}

	this.flag_comment = function(e) {
		var el = e.target;
		var id = el.getAttribute('comment_id');

		var sr = function(resp) {
			if (acl.user_can('edit_user_posts')) {
				this.isa_results(el,'not_raw',resp,{id: id})
			}
		}.bind(this);
		var er = function() { this.error(el); }.bind(this);

		if( confirm('Report this comment?') ) {
			el.addClassName('reporting');
			new Ajax.Request('/buzzfeed/comments_moderation', {method: 'post', parameters: { comment_id: id, action: 'flag_contribution' }, onSuccess: sr, onFailure: er});
		}
	}

	this.show_badges = function(obj) {
		var show_type = 'badge';
		var show_link = 'show-favorite-link';
		var hide_link = 'show-all-link';
		if ( obj.for_type == 'favorite' ) {
			show_type = 'favorite';
			show_link = 'show-all-link';
			hide_link = 'show-favorite-link';
		}
		// hide everything
		universal_dom.get_bucket_elements('badge').each(function(el){
			el.addClassName('hidden');
		});
		// reveal choice
		universal_dom.get_bucket_elements(show_type).each(function(el){
			el.removeClassName('hidden');
		});
		// show/hide appropriate links
		var el = $(show_link);
		if ( el ) el.removeClassName('hidden');
		el = $(hide_link);
		if ( el ) el.addClassName('hidden');
	}

	this.edit_image = function(e) {
		var buzz = report_manager.cache.buzzes[report_manager.current_buzz];
		
		$('user-image-edit-iframe').src="/static/images/public/spinners/big_on_eee.gif";
		BF_UI.showDialog('user-image-edit');
		$('user-image-edit-iframe').src="/buzzfeed/_edit_user_contribution_image?action=imageform&template=public/user/quickpost_imageform.tt";
		var buzz_type = 'link';
		if ( buzz.form == 'image' ) buzz_type = 'image';
		else if ( buzz.form == 'video' ) buzz_type = 'video';
		$('user-image-edit-iframe').observe('load',	function(ev){
			ev.target.contentWindow.user_image.setBuzzType(buzz_type);
		});
	}
	
	this.save_image = function(path,image,region,sendTo) {
		var buzz = report_manager.cache.buzzes[report_manager.current_buzz];
		
		var params = region;
		params.type = buzz.form + 'buzz';
		if ($('user-loading')) $('user-loading').show();
		$('user-image-edit').hide();
		params.image = path.replace(/\.(jpg|gif)$/, '');
		params.action = 'imagecrop';
		var sr = report_manager.image_saved;
		var er = report_manager.image_errored;
		var ajax = new BF_Request();
		ajax.request(sendTo, {method: 'post', parameters: params, onSuccess: sr, onFailure: er});
	}
	
	this.image_errored = function() {
		alert('There was an error trying to save your image');
	}
	
	this.image_saved = function(resp) {
		var buzz = report_manager.cache.buzzes[report_manager.current_buzz];
		
		if ( $( 'user-loading' ) ) $('user-loading').hide();
		var obj = eval('(' + resp.responseText + ')');
		if(obj.saved) {
			buzz.oldimage = buzz.image;
			buzz.image = obj.thumb_image;
			if ($('img_preview')) {
				$('img_preview').src=BF_STATIC.image_root+obj.thumb_image;
			}
		} else {
			this.image_errored();
		}
	}	
	
	this.save_edited_buzz = function(e) {
		if ( acl.user_can('edit_user_posts') ) {
			var form = report_manager.edit_form;
		
			// validation
			var errors = [];
			var required = ['name','blurb'];
			required.each( function(field) {
				if ( form.elements[field].value == '' ) errors.push('Missing required field ('+ field +')');
			});
			if ( !(form.elements['nsfw-btn'].hasClassName('selected') || form.elements['tame-btn'].hasClassName('selected')) ) {
				errors.push('Please specify if it\'s NSFW or not');
			}
			if ( errors.length ) {
				alert('Cannot save. Please address the following error' + (errors.length > 1 ? 's' : '' ) + ':\n' + errors.join('\n'));
				return;
			}
			
			// end validation
			var buzz = report_manager.cache.buzzes[report_manager.current_buzz];
			for( var each in report_manager.buzz_fields_to_text_fields ) {
				if ( form.elements[report_manager.buzz_fields_to_text_fields[each]].disabled == false) {
					buzz[each] = form.elements[report_manager.buzz_fields_to_text_fields[each]].value;
				}
				else {
					delete buzz[each];
				}
			}
			var badge_checkboxes = $('badge-checkboxes').getElementsByTagName('INPUT');
			buzz.badges = [];
			for( var i = 0; i < badge_checkboxes.length; i++ ) {
				var cbox = badge_checkboxes[i];
				if (cbox.checked) buzz.badges.push( cbox.value );
			}
			var new_tags = form.elements.tags.value.split(',');
			new_tags.each(function(tag){
				buzz.tags.push(tag);
			});
			buzz.nsfw = form.elements['nsfw-btn'].hasClassName('selected') ? 'true' : 'false';
			var ajax = new BF_Request();
			buzz.category_id = form.elements['category'].options[form.elements['category'].selectedIndex].value
			var params = {
				action:'update_buzz',
				buzz:Object.toJSON(buzz),
				update_html : 1
			};
			var promotion;
			for ( var i = 0; i < form.elements.promotion.length; i++ ) {
				if ( form.elements.promotion[i].checked ) promotion = form.elements.promotion[i].value;
			}
			if ( promotion && promotion != 'none') {
				params.promotion = promotion;
				params.action = 'update_and_promote';
			}
			if ( promotion == 'queue-at') {
				params['queue-on-day'] = form.elements['queue-on-day'].options[form.elements['queue-on-day'].selectedIndex].value;
				params['queue-on-hour'] = form.elements['queue-on-hour'].options[form.elements['queue-on-hour'].selectedIndex].value;
			}
			ajax.request('/buzzfeed/_admin', {
				method:'post',
				parameters:params,
				onSuccess:report_manager._save_edited_buzz,
				while_processing:{
					show:$('save-edited-buzz-spinner'),
					hide:e.target
				}
			});
		} 
		else {
			alert('You do not have permission to save edited buzz');
		}
	}
	
	this._save_edited_buzz = function(r) {
		var obj = eval('('+r.responseText+')');
		if ( obj.success == 1 ) {
			try{
			var buzz = report_manager.cache.buzzes[report_manager.current_buzz];
			var form = report_manager.edit_form;
			form.addClassName('hidden');
			form.parentNode.removeChild(form);
			document.getElementsByTagName('BODY')[0].appendChild(form);
			$('buzz-' + buzz.campaignid).update(obj.html);
			} catch(e){
				console.dir({e : e});
			}
		}
	}
	
	this.cancel_inline_editor = function() {
		if ( 'bf_post_tools' in window ) bf_post_tools.cancel_inline_editor();
		else {
		var buzz = report_manager.cache.buzzes[report_manager.current_buzz];
		var form = report_manager.edit_form;
		form.addClassName('hidden');
		form.parentNode.removeChild(form);
		document.getElementsByTagName('BODY')[0].appendChild(form);
		$('buzz-' + buzz.campaignid).appendChild(report_manager.current_snippet);
		}
	}
	
	this.buzz_fields_to_text_fields = {
		name : 'name',
		blurb : 'blurb',
		short_description : 'short_description'
	};
	this.load_inline_editor = function( args ) {
		if ( 'bf_post_tools' in window ) return bf_post_tools.load_inline_editor(args);
		var converter = $('_converter') ;
		if ( !converter ) {
			converter = document.createElement('div');
			converter.id = '_converter';
			converter.addClassName('hidden');
			document.getElementsByTagName('BODY')[0].appendChild(converter);
		}
		if ( args.buzz_id && typeof report_manager.cache.buzzes[ args.buzz_id ] != 'undefined' ) {
			var form = $( args.editor_id || 'editForm' );
			var show_at = $('buzz-' + args.buzz_id);
			report_manager.current_buzz = args.buzz_id;
			report_manager.edit_form = form;
			var buzz = report_manager.cache.buzzes[args.buzz_id];
			
			form.parentNode.removeChild(form);
			report_manager.current_snippet = show_at.cloneNode(true);
			show_at.update('');
			show_at.appendChild(form);
			
			form.removeClassName('hidden');
			form.elements.promotion[0].checked = true;
			for( var each in report_manager.buzz_fields_to_text_fields ) {
				converter.update(unescape(buzz[each]));
				form.elements[report_manager.buzz_fields_to_text_fields[each]].value = converter.innerHTML;
			}
			if ( buzz.form == 'enhanced' ) {
				form.elements.short_description.disabled = true;
				form.elements.short_description.value = 'Use terminal to edit';
			}
			else {
				form.elements.short_description.disabled = false;
			}
			buzz.badges.each( function(badge){
				if (typeof form.elements[badge] != 'undefined') form.elements[badge].checked = true;
			});
			var tag_list = $('tag_list');
			if ( tag_list ) {
				tag_list.update('');
				buzz.tags.each(function(tag, idx){
					if ( idx > 0 && tag != '' ) tag_list.appendChild(document.createTextNode(', '));
					tag_list.appendChild(document.createTextNode(tag));
				});
			}
			if ( buzz.nsfw == 'true' ) {
				form.elements['nsfw-btn'].removeClassName('selected');
				form.elements['tame-btn'].removeClassName('selected');
			}
			else {
				form.elements['tame-btn'].addClassName('selected');
				form.elements['nsfw-btn'].removeClassName('selected');
			}
			if ( $('img_preview') ) {
				$('img_preview').setAttribute('src',BF_STATIC.image_root + buzz.image);
			}
			if ( buzz.category_id ) {
				 var categories = form.elements.category.options;
				 for ( var i = 0; i < categories.length; i++ ) {
					 if ( categories[i].value == buzz.category_id ) {
						 categories[i].selected = true;
					 }
				 }
			}
		}
		else {
			alert('Invalid ID ('+ args.buzz_id+')');
		}
	}
	
	this.handle_click = function( args ) {
		var el = args.e.target;
		if ( args.type == 'report_user' ) {
			this.deleteUser( el, args.type );
		}
		else if ( args.type == 'edit_user' ) {
			this.editUser( el, args.type );
		}
		else if( args.type == 'toggle_raw' ) {
			this.toggle_raw( el, args.type );
		}
		else if( args.type == 'edit_buzz' ) {
			this.edit_buzz( el, args.type );
		}
		else this.report( el, args.type );
	}

	this.edit_buzz = function( el, type ) {
		this.el = el;
		var id = el.getAttribute('buzz_id');
		var isa = false;
		if (acl.user_can('edit_user_accounts')) {isa = true;}
		if ( isa ) {
			window.open(BF_STATIC.terminal_root_url + '?action=buzz_edit&bid=' + id);
		}
	}

	this.toggle_raw = function( el, type ) {
		if ( !acl.user_can('edit_user_posts') || !acl.user_can('user_moderators') ) {
			return alert('You do not have permission to toggle raw');
		}
		if ( el.event ) el = el.event.target;
		this.el = el;
		var id = el.getAttribute('user_id');
		var current_state = el.getAttribute('current_state');
		var hide_success_dialog = el.getAttribute('rel:hide_success_dialog') == 1;
		if ( current_state == 0 ) return;
		el.innerHTML = 'User Cannot Post to Raw';
		this.new_raw_state = current_state == '1' ? 0 : 1;
		var isa = false;
		if (acl.user_can('edit_user_accounts')) {isa = true;}
		if ( isa ) {
			var ajax = new BF_Request();
			ajax.request('/buzzfeed/_user_admin', {
				method:'post',
				parameters:{
					action:'update_flags',
					id:id,
					raw : this.new_raw_state
				},
				onSuccess: function(resp){
					var msg = "This user's posts will be shown in the Raw Feed";
					if( this.new_raw_state == 0 ) msg = "This user's posts will not be shown in the Raw Feed";
					if (!hide_success_dialog) alert( msg );
					el.setAttribute('current_state', this.new_raw_state);
				}.bind(this),
				onFailure: function(resp){ajax.alert('Error contacting server')},
				bf_auth: true
			});
		}
	}

	this.editUser = function( el, type ) {
		var dialog_id = 'user_admin_panel';
		if ( typeof el.event != 'undefined' ) {
			el = el.event.target;
			dialog_id += el.getAttribute('user_id') || (new Date()).getTime();
		}
		var id = el.getAttribute('user_id');
		var username = el.getAttribute('username');
		var isa = false;
		if (acl.user_can('edit_user_accounts')) {isa = true;}
		if ( isa ) {
			BF_UI.create_or_show_dialog({height:490,scrolling:'no',title:'Edit User',id:dialog_id,url:BF_STATIC.web_root + '/user_panel?username='+username,user_id:id});
		}
	}
	
	this.deleteUser = function( el, type ) {
		if ( !acl.user_can('edit_user_accounts') ) {
			return alert('You do not have permission to delete user');
		}
		if ( typeof el.event != 'undefined' ) el = el.event.target;
		var id = el.getAttribute('user_id');
		if( confirm('Are you sure you want to delete this user?') ) {
			var ajax = new BF_Request();
			ajax.request('/buzzfeed/_user_admin', {
				method:'post',
				parameters:{action:'delete',id:id},
				onSuccess: function(resp){
					alert( 'user deleted' );
				}.bind(this),
				onFailure: function(resp){ajax.alert('Error contacting server')},
				bf_auth: true
			});
		}
	}

	this.report = function( el, type ) {
		var id = el.getAttribute('contributionid');
		var param_type = 'boring';
		if (type == 'flag') {
			param_type = 'spam';
		}
		if (type == 'not_raw') {
			param_type = 'remove_from_raw_feed';
		}
		try {
			var user = new BF_User();
			var isa = false;
			var username = '';
			if (acl.user_can('edit_user_accounts')) {isa = true;}
			if (user.isLoggedIn()) {
				var userinfo = user.getUserInfo();
				if (userinfo.username) {username = userinfo.username;}
			}
			var params = {
				id: id,
				f: param_type,
				username: username
			};
			try {
                            el.addClassName('reporting');
                            if(type !== 'flag') {
                                el.innerHTML = 'Reporting...';			
                            }
			}
			catch ( e ) {}
			
			var type_string = 'remove this contribution from this page';
			if(type == 'flag') {
				var type_string = 'delete this contribution forever';			
			}
			else if ( type == 'not_raw' ) {
				var type_string = 'remove this contribution from the raw feed';
			}
			if(isa == true) {
				if( confirm('Are you sure you want to ' + type_string + '?') ) {
					this._request(el, params, isa, type);
				}				
			} else {
				this._request(el, params, isa, type);
			}
		} catch(e) {
			console.error(e);
		}		
	}

	this._request = function(el, params, isa, type) {
		var sr = function(resp) { this.report_success(el,type,resp) }.bind(this);
		var sr2 = function(resp) { this.isa_results(el,type,resp,params) }.bind(this);
		var er = function() { this.error(el); }.bind(this);
		new Ajax.Request('/buzzfeed/_flag_contribution', {method: 'get', parameters: params, onSuccess: sr, onFailure: er});		
		if(isa == true) {
			var user = new BF_User();
			params.session_key = user.getSessionKey();
			if(params.f == 'spam') {
				params.action = 'delete_buzz';			
				new Ajax.Request('/buzzfeed/_buzz_moderator', {method: 'get', parameters: params, onSuccess: sr2, onFailure: er});
			} 
			else if ( params.f == 'remove_from_raw_feed' ) {
				params.action = 'remove_from_raw_feed';			
				new Ajax.Request('/buzzfeed/_buzz_moderator', {method: 'get', parameters: params, onSuccess: sr2, onFailure: er});
			}
			else {
				params.action = 'moderate';			
				new Ajax.Request('/buzzfeed/_contribution_moderator', {method: 'get', parameters: params, onSuccess: sr2, onFailure: er});			
			}
			
		}		
	}
	
	this.report_success = function( obj, type, resp ) {	
		obj.removeClassName('reporting');
		obj.addClassName('reported');
		if(type == 'uniteresting' || type !== 'flag') {
                    obj.innerHTML = 'Flagged!';
		}                
		var json = resp.responseText.evalJSON();
	}

	this.isa_results = function(obj, type, resp, params) {
		var elid = 'contribwhat_' + params.id.toString();
		if(type == 'uniteresting') {
			$(elid).innerHTML = 'Item Moderated'; 
		} else {
			$(elid).innerHTML = 'Item Deleted'; 
		}
	}
	
	this.error = function( obj ) {
	}
}

report_manager = new bf_report_manager();
report_manager.init();
//document.observe('dom:loaded',function(){report_manager.init();});
