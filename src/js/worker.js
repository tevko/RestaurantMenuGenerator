self.addEventListener('message', e => {
	const data = JSON.parse(e.data);
	const heading = data.restName === undefined ? `<section class="menu">` : `<section class="menu"><h1 class="menu_restName">${data.restName}</h1>`;
	const menuTitle = data.title === undefined ? '' : `<h2 class="menu_title">${data.title}</h2>`;
	const footer = data.containsRaw === false ? `</section>` : `</section><footer class="menu_containsRaw">*Consuming raw or undercooked meats, poultry, seafood, shellfish, eggs or unpasteurized milk may increase your risk of foodborne illness.</footer>`;
	const style = `
		<head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
		<style>
			.menu {
				margin-bottom: 15px;
				max-width: 1200px;
    			margin: 0 auto;
			}
			.menu_restName {
				text-align: center;
    			font-size: 70px;
    			margin-top: 0;
			}
			.menu_title {
				text-align: center;
			}
			.menu_section {
				margin-bottom: 30px;
			}
			.menu_section h3 {
				font-style: italic;
			}
			.menu_item {
				margin: 0 15px;
				position: relative;
			}
			.menu_item h4 {
				margin-bottom: 0px;
			}
			.price {
				display: block;
				float: right;
				position: absolute;
				bottom: 0px;
				right: 0;
				background-color: white;
				font-weight: bold;
			}
			.description {
				margin-top: 5px;
				font-style: italic;
				background-color: white;
				display: inline-block;
				max-width: 50%;
			}
			hr {
				border: none;
    			border-top: 1px dotted black;
    			margin-top: -20px;
			}
			footer:not(.app-footer) {
				text-align: center;
    			font-size: 11px;
				font-style: italic;
			}
			@media (max-width: 575px) {
				.menu_title {
					text-align: center;
					font-size: 30px;
				}
				.menu_section h3 {
					text-align: center;
    				font-size: 30px;
				}
				.menu_item {
					text-align: center;
				}
				.price {
					float: none;
					position: static;
					margin-top: 15px;
				}
				hr {
					display: none;
				}
			}
		</style>
	`;
	let menuBody = ``;
	if (data.sections.length > 0) {
		const menuData = data.sections.map(section => {
			let container = `<div class="menu_section menu_section_${section.id}"><h3>${section.name}</h3>`;
			if (section.items.length > 0) {
				section.items.forEach(item => {
					container = container + `
						<div class="menu_item menu_item_${item.id}">
							<h4 class="name">${item.name}</h4>
							<span class="price">${item.price}</span>
							<p class="description">${item.description}</p>
							<hr>
						</div>
					`;
				});
			}
			return container + `</div>`
		});
		menuBody = menuBody + menuData.join('');
	}
	postMessage(style + heading + menuTitle + menuBody + footer);
}, false);