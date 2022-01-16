import togglePopup from './togglePopup.js';

// Read the CSRF token from the <meta> tag
const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

if (sessionStorage.getItem('userType') === 'author')
	document.querySelector('body').classList.add('author');
else if (sessionStorage.getItem('userType') === 'reader') {
	document.querySelector(
		'.banner-text'
	).innerHTML = `<span>You need to <a href="/profile?changeUserType=author">be an author</a> <br />to use this feature. <br /><h6>\*This feature is still under development and might not be available to all the users right now.</h6> </span>`;
} else {
	document.querySelector(
		'.banner-text'
	).innerHTML = `<span>You need to be logged in and be an author to use this feature. <br /><h6>\*This feature is still under development and might not be available to all the users right now.</h6> </span>`;
}

const createRandomString = () => {
	const charList = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
	let randomString = [];
	for (let x = 0; x < 32; x++) {
		randomString.push(charList[Math.floor(Math.random() * (charList.length - 1) + 0)]);
	}
	return randomString.join('');
};

const preventLeavingSite = (e) => {
	if (previewContainer.innerText !== '' && !isArticlePosted) {
		e.preventDefault();
		console.log('innerText', previewContainer.innerText);
		e.returnValue = `Are you sure you want to leave the page without saving the article? Changes won't be saved.`;
	}
};

// EDITOR RELATED CONTENT  / / / / / / / / / / / / / / / / / / / / / / / / /
const previewContainer = document.getElementById('write-preview');
const articleHeading = document.querySelector('.article-heading-element');
const h1 = document.querySelector('.h1-element');
const h2 = document.querySelector('.h2-element');
const p = document.querySelector('.p-element');
const img = document.querySelector('.img-element');
const ol = document.querySelector('.ol-element');
const ul = document.querySelector('.ul-element');
const section = document.querySelector('.section-element');
const saveBtn = document.querySelector('.save-btn');
const nextBtn = document.querySelector('.next-btn');
let isArticlePosted = false;
let articleImages = [];
let articleCoverImg;

const storeArticleImages = (id, imgTitle, imgAlt, img, imgExtension) => {
	articleImages.push({ id, imgTitle, imgAlt, img, imgExtension });
};

const addElementToPreview = (string = '') => {
	nextBtn.children[0].disabled = false;
	previewContainer.innerHTML += string;
};

previewContainer.addEventListener('input', (e) => {
	if (e.target.contains(document.querySelector('.article-heading'))) {
		articleHeading.classList.add('disabled');
	} else {
		articleHeading.classList.remove('disabled');
	}
});

articleHeading.addEventListener('click', (e) => {
	if (!previewContainer.contains(document.querySelector('.article-heading'))) {
		e.target.classList.remove('disabled');
		addElementToPreview(`<div class="article-heading" data-id="${createRandomString()}"></div>`);
	} else {
		alert('There can only be one article heading');
		e.target.classList.add('disabled');
	}
});
h1.addEventListener('click', () => {
	const index = previewContainer.children.length + 1;
	const id = createRandomString();
	addElementToPreview(`<div class="heading-1 ${id}"></div>`);
});
h2.addEventListener('click', () => {
	const index = previewContainer.children.length + 1;
	const id = createRandomString();
	addElementToPreview(`<div class="heading-2 ${id}"></div>`);
});
p.addEventListener('click', () => {
	const index = previewContainer.children.length + 1;
	const id = createRandomString();
	addElementToPreview(`<div class="paragraph ${id}"></div>`);
});
img.addEventListener('click', () => {
	const popupData = `<label for="article-images" class="img-container"></label>
		<div class="img-settings-container">
			<form name="articleImagesForm" class="article-images-form">
				<input type="text" name="imageName" id="image-name" placeholder="Image Name" required/>
				<input type="text" name="imageAlt" id="image-alt" placeholder="Image Alt Description / Image Caption" />
				<input type="file" name="articleImages" id="article-images" accept=".png,.jpeg,.jpg,.webp" required/>
				<input type="submit" value="" id="article-images-submit" />
			</form>
			<label for="article-images-submit" class="done-btn" disabled>Add Image</label>
		</div>`;
	togglePopup(popupData, 'add-image-to-article', false);
	document
		.querySelector(`.article-images-form input[type="file"]`)
		.addEventListener('change', (e) => {
			if (e.target.files.length > 0) {
				document.querySelector('.img-settings-container .done-btn').disabled = 'false';
				document.querySelector('.img-container').innerHTML = '';
				const files = e.target.files;
				document.querySelector('#image-name').value === ''
					? (document.querySelector('#image-name').value = files[0].name)
					: '';
				for (const file of files) {
					const img = document.createElement('img');
					img.src = URL.createObjectURL(file);
					document.querySelector('.img-container').appendChild(img);
				}
			}
		});

	document.articleImagesForm.addEventListener('submit', (e) => {
		e.preventDefault();

		const imgTitle = document.querySelector('#image-name').value;
		const imgAlt = document.querySelector('#image-alt').value;
		const img = document.querySelector('#article-images').files[0];
		const imgExtension = img.name.split('.').at(-1);
		const imgId = createRandomString();
		storeArticleImages(imgId, imgTitle, imgAlt, img, imgExtension);
		addElementToPreview(
			`<div class="image">
				<img src="${URL.createObjectURL(img)}" title="${
				imgAlt || imgTitle
			}" alt="${imgAlt}" data-id="${imgId}" data-file-extension="${imgExtension}">
			</div>`
		);
		togglePopup();
	});
});
// section.addEventListener('click', () => {
// 	addElementToPreview('<div class="section"></div>');
// });
nextBtn.addEventListener('click', (e) => {
	if (previewContainer.innerText !== '') {
		addCoverImgToArticle();
	} else alert('Article body cannot be empty');
});

// / / / / / / / / / / / / / / / / / / / / / / / / // / / / / / / / / / / / / // / / / / / / / / / / / /

window.addEventListener('beforeunload', (e) => preventLeavingSite(e));

// / / / / / / / / / / / / / / / / / / / / / / / / // / / / / / / / / / / / / // / / / / / / / / / / / /
const addCoverImgToArticle = () => {
	const popupData = `
			<div class="add-article-cover-img-container">
			<div> Add a Banner Image to the Article </div>
				<form name="articleCoverImageForm" id="article-cover-img-form">
					<input type="file" name="articleCoverImg" id="article-cover-img" accept=".png,.jpeg,.jpg,.webp"/>
					<label for="article-cover-img"></label>
					<input type="submit" value="Next" disabled/>
				</form>
			</div>
		`;
	togglePopup(popupData, 'add-article-cover-img', false);
	// if (articleCoverImg.file && articleCoverImg.elementString) {
	// 	document.querySelector(
	// 		'label[for="article-cover-img"]'
	// 	).innerHTML = articleCoverImg.elementString;
	// 	document.querySelector('#article-cover-img-form > input[type="submit"]').disabled = false;
	// }

	document.querySelector('#article-cover-img').addEventListener('change', (e) => {
		if (e.target.files[0] !== undefined) {
			document.querySelector('#article-cover-img-form > input[type="submit"]').disabled = false;
			document.querySelector(
				'#article-cover-img-form > label'
			).innerHTML = `<img src="${URL.createObjectURL(e.target.files[0])}">`;
		}
	});
	document.articleCoverImageForm.addEventListener('submit', (e) => {
		e.preventDefault();
		articleCoverImg = document.querySelector('#article-cover-img').files[0];
		finalizeArticle();
	});
};

const finalizeArticle = () => {
	const popupData = `
				<div class="finalize-article-container">
					<div class="article-preview">
						<div class="article-data-container">
							<div class="article-img-and-heading-container">
								<div class="article-img-container"></div>
								<div class="article-heading-and-stats-container">
									<span class="article-heading"></span>
								</div>
							</div>
							<div class="article-data"></div>
						</div>
					</div>
					<form name="finalizeArticleForm" id="finalize-article-form">
						<input type="text" name="articleTitle" class="article-title" placeholder="Article Title" spellcheck="true" required/>
						<textarea name="articleDescription" class="article-description" cols="10" placeholder="Article Description" rows="5" required></textarea>
						<textarea name="articleFootnotes" class="article-footnotes" cols="10" placeholder="Footnotes" rows="5"></textarea>
						<input type="submit" value="Save Article" class="save-btn" aria-label="Save article"/>
					</form>
				</div>
			`;
	togglePopup(popupData, 'finalize-article', true, true);

	const htmlHead = document.getElementsByTagName('head')[0];
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.type = 'text/css';
	link.href = '/styles/article.css';
	htmlHead.appendChild(link);

	let articleTitle = '';
	let articleBody = '';
	if (previewContainer.innerText.trim() === '') {
		alert('Article body cannot be empty.');
	} else {
		let children = previewContainer.children;
		console.log(children);
		for (let x = 0; x < children.length; x++) {
			if (children[x].classList.contains('article-heading')) {
				articleTitle = children[x].innerText;
			}
			if (children[x].classList.contains('heading-1')) {
				articleBody += `<h1>${children[x].innerText}</h1>`;
			}
			if (children[x].classList.contains('heading-2')) {
				articleBody += `<h2>${children[x].innerText}</h2>`;
			}
			if (children[x].classList.contains('paragraph')) {
				articleBody += `<p>${children[x].innerText}</p>`;
			}
			if (children[x].classList.contains('image')) {
				const imgAlt = children[x].children[0].getAttribute('alt');
				const imgId = children[x].children[0].getAttribute('data-id');
				const imgFileExtension = children[x].children[0].getAttribute('data-file-extension');
				articleBody += `<img src="${imgId}.${imgFileExtension}" alt="${imgAlt}" title="${imgAlt}" data-id="${imgId}">`;
			}
		}

		let articleBodyAlt = articleBody;
		articleImages.forEach((x) => {
			articleBodyAlt = articleBodyAlt.replace(
				`src="${x.id}.${x.imgExtension}"`,
				`src="${URL.createObjectURL(x.img)}"`
			);
		});
		console.log(articleBody, articleBodyAlt);
		document.querySelector(
			'.article-preview .article-data-container .article-img-and-heading-container .article-heading-and-stats-container .article-heading'
		).innerHTML = articleTitle;
		document.querySelector('#finalize-article-form .article-title').value = articleTitle;
		document.querySelector(
			'.article-preview .article-data-container .article-data'
		).innerHTML = `${articleBodyAlt} <div class="end"></div> <div class="footnotes"></div>`;
		document.querySelector(
			'.article-preview .article-data-container .article-img-and-heading-container .article-img-container'
		).innerHTML = ` <img src="${URL.createObjectURL(articleCoverImg)}"> `;
		document
			.querySelector('#finalize-article-form .article-title')
			.addEventListener('input', (e) => {
				document.querySelector(
					'.article-preview .article-data-container .article-img-and-heading-container .article-heading-and-stats-container .article-heading'
				).innerHTML = e.target.value;
			});
		document
			.querySelector('#finalize-article-form .article-footnotes')
			.addEventListener('input', (e) => {
				document.querySelector(
					'.article-preview .article-data-container .article-data .footnotes'
				).innerHTML = e.target.value;
			});
	}

	document.finalizeArticleForm.addEventListener('submit', (e) => {
		e.preventDefault();
		document.querySelector('#finalize-article-form .save-btn').value = 'uploading...';
		document.querySelector('#finalize-article-form .save-btn').disabled = 'true';
		document.querySelector('#finalize-article-form .save-btn').classList.add('uploading');
		const articleForm = new FormData(document.finalizeArticleForm);
		articleForm.append('articleBody', articleBody);
		articleForm.append('articleCoverImg', articleCoverImg);
		articleImages.map((image) => {
			articleForm.append(
				'articleImages',
				image.img,
				`${image.id}.${image.img.name.split('.').at(-1)}`
			);
		});
		fetch('data/upload/write/add-new-article', {
			method: 'POST',
			headers: {
				'CSRF-Token': token,
			},
			body: articleForm,
		})
			.then((res) => res.json())
			.then((res) => {
				if (res && res.success) {
					isArticlePosted = true;
					const popupData = `
								<div class="success-heading">Article added successfully.</div>
								<img src="/images/success.webp" class="success-img">
								<div class="success-description">
									You have successfully added your article and can be viewed at the site. <br>
									You can view your articles in your profile page. 
								</div>
								<button class="go-to-my-article-btn">Go to the article</button>
							`;
					togglePopup(popupData, 'article-added', true);
					document
						.querySelector('.go-to-my-article-btn')
						.addEventListener('click', () => window.location.replace(res.articleUrl));
					window.removeEventListener('beforeunload', (e) => preventLeavingSite(e));
				} else {
					document.querySelector('#finalize-article-form .save-btn').disabled = 'false';
					alert(res.message);
					console.log(res.message);
				}
			});
	});
};
