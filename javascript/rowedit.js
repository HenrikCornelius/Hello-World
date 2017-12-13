/*!
 * rowEdit v0.0.1
 * Copyright (c) 2017 Henrik Cornelius Christensen
 * Licensed under MIT
 */

/**
 * @description Inline editor for HTML table rows
 * @version v0.0.1
 * @author Henrik Cornelius Christensen
 */

if (typeof jQuery === 'undefined') {
  throw new Error('rowEdit requires jQuery library.');
}

;(function($) {
'use strict';
$.rowEdit = function(pTable, options) {

	var defaults = {
            url: window.location.href,
			confirmDelete: true,
			fixedIdentifier: '',
            inputClass: 'form-control input-sm',
            groupClass: 'btn-group btn-group-sm',
            toolbarClass: 'btn-toolbar',
            dangerClass: 'danger',
            warningClass: 'warning',
            eventType: 'click',
            rowIdentifier: 'id',
            editButton: true,
            saveButton: true,
            deleteButton: true,
			toolbarHeading: 'Action',
            buttons: {
                edit: {
                    class: 'btn btn-sm btn-default',
                    html: '<span class="glyphicon glyphicon-pencil"></span>',
                    action: 'edit'
                },
                undo: {
                    class: 'btn btn-sm btn-default',
                    html: '<i class="fa fa-undo fa-lg"></i>',
                    action: 'undo'
                },
                delete: {
                    class: 'btn btn-sm btn-default',
                    html: '<span class="glyphicon glyphicon-trash"></span>',
                    action: 'delete'
                },
                save: {
                    class: 'btn btn-sm btn-default',
                    html: '<i class="fa fa-floppy-o fa-lg" aria-hidden="false"></i>'
                }            },
            onDraw: function() { return; },
            onSuccess: function() { return; },
            onFail: function() { return; },
            onAlways: function() { return; },
            onAjax: function() { return; }
        };

	var column_defaults = {
		index: -1,
		name: null,
		input: null, // '<input name="columnName" type="text"></input>',
		options: {},
		onDraw: function() { return; }
	};
	
	var rowEdit = this;
	var settings = {};
	var vars = {state: 'initial', lastEditedRow: null};

// Public methods
	rowEdit.foo_public_method = function() {
		// code goes here
	}
	rowEdit.drawToolbar = function() {
			settings = rowEdit.table.data('rowEditSettings');
			vars = rowEdit.table.data('rowEditVars');
			if (settings.editButton || settings.deleteButton) {
			    var editButton = '';
			    var deleteButton = '';
			    var saveButton = '';

			    // Add toolbar column header if not exists.
			    if (rowEdit.table.find('th.tabledit-toolbar-column').length === 0) {
			        rowEdit.table.find('tr:first').append('<th class="tabledit-toolbar-column">' + settings.toolbarHeading + '</th>');
			    }

			    // Create edit button.
			    if (settings.editButton) {
			        editButton = '<button type="button" class="tabledit-edit-button ' + settings.buttons.edit.class + '" style="float: none;">' + settings.buttons.edit.html + '</button>';
			    }

			    // Create delete button.
			    if (settings.deleteButton) {
			        deleteButton = '<button type="button" class="tabledit-delete-button ' + settings.buttons.delete.class + '" style="float: none;">' + settings.buttons.delete.html + '</button>';
			    }

			    // Create save button.
			    if (settings.editButton && settings.saveButton) {
			        saveButton = '<button type="button" class="tabledit-save-button ' + settings.buttons.save.class + '" style="float: none;" disabled>' + settings.buttons.save.html + '</button>';
			    }

				// Append toolbar to each row
				rowEdit.table.find('tbody>tr').each(function() {
					var toolbar = '<div class="tabledit-toolbar ' + settings.toolbarClass + '" style="text-align: left;">\n'
								+ '<div class="' + settings.groupClass + '" style="float: none;">\n'
								+ editButton  + '\n'
								+ saveButton + '\n';
					if ($(this).data("allow-delete") !== false) {
						toolbar += deleteButton + '\n'
					}
					toolbar += '</div>\n'
							+ '</div></div>';

					// Add toolbar column cells.
					var toolbarCell = $(this).find('.tabledit-toolbar-cell');
					if (toolbarCell.length === 0) {
						$(this).append('<td style="white-space: nowrap; width: 1%;" class="tabledit-toolbar-cell">' + toolbar + '</td>');
					} else {
						$(toolbarCell).each(function() {
							$(this).html(toolbar);
						});
					}
				});
			}
		} // drawToolbar

	var init = function() {
		vars.state = 'viewing';
		settings = $.extend( true, defaults, options);
		rowEdit.table = $(pTable);
		// Extract name from element definition and store it as name property.
		$(settings.columns.editable).each(function(i,co) {
			var myInput = $.parseHTML(co.input);
			co.name = $(myInput).attr('name');
		});
		// Save the configuration settings
		rowEdit.table.data('rowEditSettings',settings);
		rowEdit.table.data('rowEditVars',vars);
		// code goes here
		rowEdit.drawToolbar();
	}

	var beginEdit = function(pRow) {
		var zx = 'debug';
		$(rowEdit.table).find('tr.tabledit-editing').each(function(i,foundRow) {undoEdit(foundRow)});
			
		for (var i = 0; i < settings.columns.editable.length; i++) {
			var $td = $(pRow).find('td:nth-child(' + (parseInt(settings.columns.editable[i].index) + 1) + ')');
			var tdText = $($td).text();
			var tdHtml = $($td).html();
			$($td).data('undoData', tdHtml);
			var myInput = $.parseHTML(settings.columns.editable[i].input);
			$(myInput).addClass(settings.inputClass);
			var tdText = $($td).text();
			if ( $(myInput).is('select') ) {
				var myOptions = '';
				// Create options for select element.
				$.each(jQuery.parseJSON(settings.columns.editable[i].options), function(index, value) {
					if (tdText === value) {
						myOptions += '<option value="' + index + '" selected>' + value + '</option>';
					} else {
						myOptions += '<option value="' + index + '">' + value + '</option>';
					}
				});
				$(myInput).append(myOptions);
//				$.each(settings.columns.editable[i].options, function (i, item) {
//					$(myInput).append($('<option>', { value: item.value, text : item.text }));
//				});
			} else {
				$(myInput).val(tdText);
			}
			$($td).html('');
			$($td).append(myInput);
		}
		var button = $(pRow).find('button.tabledit-edit-button').get(0);
		$(button).data('buttonAction','undo');
		$(button).children().remove();
		$(button).append(settings.buttons.undo.html);
		var button = $(pRow).find('button.tabledit-save-button').get(0);
		$(button).prop('disabled',false);
		$(pRow).addClass('tabledit-editing');
		vars.state = 'editing';
	}
	
	var undoEdit = function(pRow) {
		var zx = 'debug';
		for (var i = 0; i < settings.columns.editable.length; i++) {
			var $td = $(pRow).find('td:nth-child(' + (parseInt(settings.columns.editable[i].index) + 1) + ')');
			var tdText = $($td).data('undoData');
			$($td).html(tdText);
		}
		var button = $(pRow).find('button.tabledit-edit-button').get(0);
		$(button).data('buttonAction','edit');
		$(button).children().remove();
		$(button).append(settings.buttons.edit.html);
		var button = $(pRow).find('button.tabledit-save-button').get(0);
		$(button).prop('disabled',true);
		$(pRow).removeClass('tabledit-editing');
		vars.state = 'viewing';
	}
	
	var makeQueryString = function(pRow, pAction, includeCols) {
		var wrkField = $.parseHTML('<input type="text">');
		var formData = '&action=' + pAction;
		$(settings.fixedIdentifier).each(function(i,co) {
			$(wrkField).attr('name', (co.name));
			$(wrkField).val( co.value );
			formData += '&' + $(wrkField).serialize();
		});
		$(settings.columns.identifier).each(function(i,co) {
			var cell = $(pRow.cells).get(co.index);
			$(wrkField).attr('name', (co.name));
			$(wrkField).val( $(cell).text() );
			formData += '&' + $(wrkField).serialize();
		});
		if (includeCols === false) {return formData};
		$(settings.columns.editable).each(function(i,co) {
			var cell = $(pRow.cells).get(co.index);
			$(cell).children().each(function(i2,elem) {
				if ($(elem).is('input') || $(elem).is('select')) {
					formData += '&' + $(elem).serialize();
				}
			});
		});
		return formData;
	}
	
	var dataFromServer = function(pRow, pData) {
		$(settings.columns.identifier).each(function(i,co) {
			var $td = $(pRow).find('td:nth-child(' + (parseInt(co.index) + 1) + ')');
			var tdText;
			if (typeof pData[co.name] === undefined) {
				tdText = $($td).data('undoData');
			} else {
				tdText = pData[co.name];
			}
			$($td).children().remove();
			$($td).html(tdText);
		});
		$(settings.columns.editable).each(function(i,co) {
			var $td = $(pRow).find('td:nth-child(' + (parseInt(co.index) + 1) + ')');
			var tdText;
			if (typeof pData[co.name] === undefined) {
				tdText = $($td).data('undoData');
			} else {
				tdText = pData[co.name];
			}
			$($td).children().remove();
			$($td).html(tdText);
		});
	}
	
	var beginSave = function(pRow) {
		var formData = makeQueryString(pRow, 'save', true);
		var ajaxData = {
			url: settings.url,
			data: formData,
			method: 'post',
			cache: false,
			dataType: 'json',
			async: false,
			success: function(data, textStatus, jqXHR) {
				$(pRow).removeClass(settings.dangerClass);
				dataFromServer(pRow, data);
				var button = $(pRow).find('button.tabledit-edit-button').get(0);
				$(button).data('buttonAction','edit');
				$(button).children().remove();
				$(button).append(settings.buttons.edit.html);
				var button = $(pRow).find('button.tabledit-save-button').get(0);
				$(button).prop('disabled',true);
				$(pRow).removeClass('tabledit-editing');
			},
			error: function(jqXHR, textStatus, errorThrown) {
				$(pRow).addClass(settings.dangerClass);
				alert( 'Update failed: ' + jqXHR.statusText);
			}
		};
		var jqXHR = $.ajax(ajaxData);
		if (jqXHR.status !== 200) {
			alert( 'Wrong status: ' + jqXHR.statusText);
		}
	}

	var beginDelete = function(pRow) {
		if (settings.confirmDelete === true) {
			$(pRow).addClass(settings.dangerClass);
			if (confirm('Do you want to delete the highlighted row?') === false) {
				$(pRow).removeClass(settings.dangerClass);
				return;
			}
		}
		var formData = makeQueryString(pRow, 'delete', false);
		var ajaxData = {
			url: settings.url,
			data: formData,
			method: 'post',
			cache: false,
			dataType: 'text',
			async: false,
			success: function(data, textStatus, jqXHR) {
				$(pRow).removeClass(settings.dangerClass);
				undoEdit(pRow);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				$(pRow).addClass(settings.dangerClass);
				alert( 'Delete failed: ' + textStatus);
			}
		};
		var jqXHR = $.ajax(ajaxData);
		if (jqXHR.status !== 200) {
			alert( 'Wrong status: ' + jqXHR.statusText);
		}
	}

	var execAjax = function(pForm) {
		var ajaxData = {
			url: settings.url,
			data: pForm,
			method: 'post',
			cache: false,
			dataType: 'text',
			async: false,
			success: function(jqXHR, textStatus, errorThrown) {},
			error: function(jqXHR, textStatus, errorThrown) {
				alert( 'Update failed: ' + textStatus);
			}
		};
	}
	
	
	init();

	if (settings.editButton) {
		rowEdit.table.on('click', 'button.tabledit-edit-button', function(event) {
			if (event.handled !== true) {
				rowEdit.table = $(this).closest('table').get(0);
				settings = $(rowEdit.table).data('rowEditSettings') || {};
				vars = $(rowEdit.table).data('rowEditVars');
				var tr = $(this).closest('tr').get(0);
				if ($(this).data('buttonAction') === 'undo') {
					undoEdit(tr);
				} else {
					beginEdit(tr);
				}
				event.preventDefault();
				event.handled = true;
				return;
			}
		});
	}

	if (settings.saveButton) {
		rowEdit.table.on('click', 'button.tabledit-save-button', function(event) {
			if (event.handled !== true) {
				rowEdit.table = $(this).closest('table').get(0);
				settings = $(rowEdit.table).data('rowEditSettings') || {};
				vars = $(rowEdit.table).data('rowEditVars');
				var tr = $(this).closest('tr').get(0);
				beginSave(tr);
				event.preventDefault();
				event.handled = true;
				return;
			}
		});
	}

	if (settings.deleteButton) {
		rowEdit.table.on('click', 'button.tabledit-delete-button', function(event) {
			if (event.handled !== true) {
				rowEdit.table = $(this).closest('table').get(0);
				settings = $(rowEdit.table).data('rowEditSettings') || {};
				vars = $(rowEdit.table).data('rowEditVars');
				var tr = $(this).closest('tr').get(0);
				beginDelete(tr);
				event.preventDefault();
				event.handled = true;
				return;
			}
		});
	}

} // $.rowEdit
})(jQuery);
