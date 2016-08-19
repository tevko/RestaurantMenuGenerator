{
	const createMenu = {
		settings: {
			addSection: document.querySelector('._JS_addSection'),
			addItem: document.querySelector('._JS_addItem'),
			menuSection: document.querySelector('._JS_menuSection'),
			menuItem: document.querySelector('._JS_menuItem'),
			miContainer: document.querySelector('._JS_menuItemContainer'),
			menuSectionTemplate: document.querySelector('#_JS_menuSection'),
			menuItemTemplate: document.querySelector('#_JS_menuItem'),
			deleteButton: '_JS_deleteButton',
			dataCollection: {
				restName: undefined,
				title: undefined,
				sections: []
			},
			menuWorker: new Worker('/build/js/worker.js')
		},
		init() {
			const s = this.settings;
			if (window.localStorage.menu !== undefined) {
				this.restoreSavedMenu();
			}
			document.querySelector('._JS_downloadMenu').addEventListener('click', () => {
				this.downloadMenu(document.querySelector('._JS_menuPreview').innerHTML, s.dataCollection.title);
			});
			document.querySelector('._JS_menuPreview').addEventListener('click', e => {
				this.togglePreviewWindow(e.target);
			});
			s.menuWorker.addEventListener('message', e => {
				this.updateMenuHTML(e.data, 'receive');
			});
			document.body.addEventListener('click', e => {
				if (e.target.classList.contains('_JS_addSection')) {
					e.preventDefault();
					//insert menu template
					this.createContent(e.target, s.menuSectionTemplate, 'menuSection');
				} else if (e.target.classList.contains('_JS_addItem')) {
					e.preventDefault();
					//insert menu item
					this.createContent(e.target, s.menuItemTemplate, 'menuItem');
				} else if (e.target.classList.contains(s.deleteButton)) {
					this.deleteContent(e);
					this.saveMenu();
				}
			});
			document.body.addEventListener('change', e => {
				if (e.target.id === 'raw') {
					e.target.checked ? s.dataCollection.containsRaw = true : s.dataCollection.containsRaw = false;
				} else {
					this.dataCollector(e.target);
				}
				this.saveMenu();
			});
			document.querySelector('._JS_reset').addEventListener('click', () => {
				this.resetAll()
			});
		},
		createContent(container, template, identifier) {
			var tmp = template.content.cloneNode(true);
			var attr = (Math.round(Date.now() / 100)).toString();
			tmp.querySelector('section').setAttribute(`data-${identifier}`, attr);
			container.parentElement.replaceChild(tmp, container);
		},
		deleteContent(button) {
			const s = this.settings;
			if (window.confirm('Are you sure you\'d like to delete this?')) {
				const content = button.target.parentElement;
				const parent = content.parentElement;
				s.dataCollection.sections.some((e, i) => {
					if (button.target.parentElement.classList.contains('_JS_menuItemContainer')) {
						return e.items.some((obj, idx) => {
							//menu item
							if (obj.id === button.target.parentElement.getAttribute('data-menuitem')) {
								s.dataCollection.sections[i].items.splice(idx, 1);
							}
						});
					} else {
						//menu section
						if (e.id === button.target.parentElement.getAttribute('data-menusection')) {
							s.dataCollection.sections.splice(i, 1);
						}
					}
				});
				parent.removeChild(content);
			}
		},
		dataCollector(target) {
			const id = target.getAttribute('data-identifier');
			const value = target.value;
			const collection = this.settings.dataCollection;
			let hash;
			let parentIdentifier;
			let itemIdentifier;
			let sectionExistsInMenu;
			let itemExistsInSection;
			switch (id) {
				case 'restaurantName':
					collection.restName = value;
					break;
				case 'menuTitle':
					collection.title = value;
					break;
				case 'menuSection':
					hash = this.findParentAttribute('data-menusection', target);
					sectionExistsInMenu = collection.sections.length > 0 && collection.sections.some(sec => {
						if (sec.id === hash) {
							sec.name = value;
							return true
						}
					});
					if (!sectionExistsInMenu) {
						collection.sections.push({
							'id' : hash,
							'name' : value,
							'items' : []
						});
					}

					break;
				case 'menuItem':
					parentIdentifier = this.findParentAttribute('data-menusection', target);
					hash = this.findParentAttribute('data-menuitem', target);
					collection.sections.some(obj => {
						if (obj.id === parentIdentifier) {
							itemExistsInSection = obj.items.length > 0 && obj.items.some(itm => {
								if (itm.id === hash) {
									itm.name = value;
									return true
								}
							});
							if (!itemExistsInSection) {
								obj.items.push({
									'id' : hash,
									'name' : value,
									'price' : undefined,
									'description' : undefined
								});
							}
							return true
						}
					});
					break;
				case 'menuItemPrice':
					this.insertMenuDetails('price', target, collection, value);
					break;
				case 'menuItemDesc':
					this.insertMenuDetails('description', target, collection, value);
					break;
				default:
					//do nothing
			}
		},
		saveMenu() {
			const s = this.settings;
			const menuJSON = JSON.stringify(s.dataCollection);
			localStorage.setItem('menu', menuJSON);
			this.updateMenuHTML(menuJSON, 'send');
		},
		findParentAttribute(id, ctx) {
			if (ctx.hasAttribute(id)) {
				return ctx.getAttribute(id);
			} else {
				return this.findParentAttribute(id, ctx.parentElement)
			}
			return false
		},
		insertMenuDetails(field, target, collection, value) {
			const itemIdentifier = this.findParentAttribute('data-menuitem', target);
			collection.sections.some(obj => {
				return obj.items.some(item => {
					if (item.id === itemIdentifier) {
						item[field] = value;
						return true
					}
				});
			});
		},
		updateMenuHTML(data, action) {
			const s = this.settings;
			const preview = document.querySelector('._JS_menuPreview');
			if (action === 'send') {
				s.menuWorker.postMessage(data);
			} else {
				preview.innerHTML = '';
				preview.insertAdjacentHTML('afterbegin', data);
			}
		},
		togglePreviewWindow(target) {
			target.classList.toggle('showPreview');
		},
		downloadMenu(data, fileName) {
			alert('The menu should download immediately, but you may need to manually save it as an HTML document with the ".html" file extension');
			const a = document.createElement('a');
			const content = data;
			const blob = new Blob([data], {type: 'text/html'});
			const url = window.URL.createObjectURL(blob);

			try {
				document.body.appendChild(a);
				a.style = 'display: none';
				a.href = url;
				a.download = fileName;
				a.click();
			} catch (e) {
				window.location.assign(url);
			}
		},
		restoreSavedMenu() {
			const s = this.settings;
			const saved = JSON.parse(window.localStorage.menu);
			s.dataCollection = saved;
			document.querySelector('#raw').checked = saved.containsRaw === true ? 'checked' : null;
			document.querySelector('[data-identifier="restaurantName"]').value = saved.restName || '';
			document.querySelector('[data-identifier="menuTitle"]').value = saved.title || '';
			saved.sections.forEach((section, idx) => {
				this.createContent(document.querySelector('._JS_addSection'), s.menuSectionTemplate, 'menuSection');
				document.querySelectorAll('.form_menuSection')[idx].setAttribute('data-menusection', section.id);
				document.querySelectorAll('[data-identifier="menuSection"]')[idx].value = section.name || '';
				//item re-creation
				section.items.forEach((itm, indx) => {
					this.createContent(document.querySelectorAll('.form_menuSection')[idx].querySelector('._JS_addItem'), s.menuItemTemplate, 'menuItem');
					document.querySelectorAll('.form_menuSection')[idx].querySelectorAll('._JS_menuItemContainer')[indx].setAttribute('data-menuitem', itm.id);
					document.querySelectorAll('.form_menuSection')[idx].querySelectorAll('[data-identifier="menuItem"]')[indx].value = itm.name || '';
					document.querySelectorAll('.form_menuSection')[idx].querySelectorAll('[data-identifier="menuItemPrice"]')[indx].value = itm.price || '';
					document.querySelectorAll('.form_menuSection')[idx].querySelectorAll('[data-identifier="menuItemDesc"]')[indx].value = itm.description || '';
				});
			});
			this.saveMenu();
		},
		resetAll() {
			if (confirm('Are you sure? All Data will be lost!')) {
				localStorage.removeItem('menu');
				window.location.reload();
			}
		}
	};
	createMenu.init();
}