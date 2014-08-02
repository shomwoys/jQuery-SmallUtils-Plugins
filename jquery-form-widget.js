$(function(){
	var cbw_id = 0;
	$.fn.extend({
		addCheckboxWidget : function(){
			$(this).filter('input[type="checkbox"]').each(function(){
				var $input = $(this), $label = $input.closest('label');
				var $widget = $('<div class="checkbox-widget"><div class="checkbox-widget-inner"><div class="checkbox-on"><span>ON</span></div><div class="checkbox-handle"></div><div class="checkbox-off"><span>OFF</span></div></div></div>');
				if ($label[0]) {
					if ($label.css('position') == 'static') {
						$label.css({
							position: 'relative',
							display: 'inline-block'
						});
					}
					$input.after($widget);
				} else {
					var id = $input.attr('id');
					if (!id) {
						cbw_id++;
						id = '#cbw_' + cbw_id;
						$input.attr('id', id);
					}
					$label = $('<label>').attr('for', id).append($widget).insertAfter($input).append($input);
				}
			});
		},
		setEditableToggle : function(toggle_html){
			$(this).filter('input[type="text"],textarea').each(function(){
				var $input = $(this);
				toggle_html = toggle_html || '<a class="toggle-editable" href="#">Edit</a>';
				$(toggle_html).addClass('toggle-editable').insertAfter($input);
				$input.attr('readonly', 'readonly');
			});
		}
	});
	
	$(document).on('click', '.toggle-editable', function(ev){
		var $input = $(this).prev(':input'), $this = $(this);
		if ($input[0]){
			var readonly = !!$input.attr('readonly');
			if (readonly) {
				$this.hide();
				$input.removeAttr('readonly').focus();
			} else {
				$this.show();
				$input.attr('readonly', 'readonly');
			}
		}
		ev.preventDefault();
	}).on('blur', '[data-toggle-editable]', function(){
		var $toggle = $(this).next('.toggle-editable'), $this = $(this);
		if ($toggle[0]){
			$this.attr('readonly', 'readonly');
			$toggle.show();
		}
	});
	
	$(':input[data-toggle-editable]').each(function(){
		$(this).setEditableToggle();
	});
	
	$('label.checkbox-switch input[type="checkbox"]').addCheckboxWidget();
});
