import timeFromNow from './timeFromNow.js';
import togglePopup from './togglePopup.js';
// import Popup from './togglePopup.js';
import valueRounder from './valueRounder.js';
import displayAlertPopup from './displayAlertPopup.js';

// Read the CSRF token from the <meta> tag
const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
const userId = sessionStorage.getItem('userId');
let requestingArticleName = `/data${window.location.pathname}`;
let reactions = {
	liked: null,
	bookmarked: null,
};

const renderData = (res) => {
	const { success, data } = res;
	console.log(res);
	if (success) {
		const { article, author, user } = data;
		document.title = `ZEERUM \| ${article.title}`;
		document.querySelector(
			'.article-img-container'
		).innerHTML = `<img src="${article.coverImg}"/>`;
		document.querySelector(
			'.article-heading-and-stats-container > .article-heading'
		).innerHTML = `${article.title}`;
		document.querySelector(
			'.article-heading-and-stats-container > .article-stats'
		).innerHTML = `<span class="views"><i class="fas fa-eye"></i> ${valueRounder(
			article.views.allTime
		)} views</span>`;
		document.querySelector('.article-data-container > .article-data').innerHTML = `${
			article.article
		}<div class="end"></div><div class="footnotes">${
			article.footnotes || ''
		}</div><div class="categories">${article.categories
			.map(
				(x) =>
					`<a href="/categories/${x.toLowerCase()}"><span class="category">${x}</span></a>`
			)
			.join('')}</div><div class="tags">${article.tags
			.map((tag) => `<a href="/tags/${tag}"><span class="tag">#${tag}</span></a>`)
			.join('')}</div>`;
		document.querySelector('.author > .author-data-container').innerHTML = `<img src="${
			author.profilePictureUrl || '/images/user.webp'
		}" alt="" /><span class="name">${author.firstName} ${author.lastName} ${
			userId && Number(userId) === Number(author.userId) ? '(You)' : ''
		}</span>${
			user !== undefined
				? user.followings.includes(Number(author.userId))
					? `<button class="follow-author-btn follow-author-btn-followed" title="Click to unfollow ${author.firstName}"><i class="fas fa-check"></i> Followed</button>`
					: Number(author.userId) !== Number(userId)
					? `<button class="follow-author-btn"><i class="fas fa-add" title="Click to follow ${author.firstName}"></i> Follow</button>`
					: ''
				: ''
		}`;
		document.querySelector('.author-data-container > img').addEventListener('click', () => {
			document.location = `/user/${author.fullName.toLowerCase()}`;
		});
		document.querySelector('.author-data-container > .name').addEventListener('click', () => {
			document.location = `/user/${author.fullName.toLowerCase()}`;
		});
		if (document.body.contains(document.querySelector('.follow-author-btn'))) {
			document.querySelector('.follow-author-btn').addEventListener('click', () => {
				if (
					document
						.querySelector('.follow-author-btn')
						.classList.contains('follow-author-btn-followed')
				) {
					fetch(`/data/profile?followUser=false&followingUserId=${author.userId}`, {
						headers: {
							'CSRF-Token': token,
						},
					})
						.then((res) => res.json())
						.then((res) => {
							console.log(res);
							if (res.success) {
								document
									.querySelector('.follow-author-btn')
									.classList.remove('follow-author-btn-followed');
								document.querySelector('.follow-author-btn').innerHTML =
									'<i class="fas fa-add"></i> follow';
								document.querySelector(
									'.follow-author-btn'
								).title = `Click to follow ${author.firstName}`;
							} else displayAlertPopup('info', res.message);
						});
				} else {
					fetch(`/data/profile?followUser=true&followingUserId=${author.userId}`, {
						headers: {
							'CSRF-Token': token,
						},
					})
						.then((res) => res.json())
						.then((res) => {
							console.log(res);
							if (res.success) {
								document
									.querySelector('.follow-author-btn')
									.classList.add('follow-author-btn-followed');
								document.querySelector('.follow-author-btn').innerHTML =
									'<i class="fas fa-check"></i> followed';
								document.querySelector(
									'.follow-author-btn'
								).title = `Click to unfollow ${author.firstName}`;
							} else displayAlertPopup('info', res.message);
						});
				}
			});
		}
		document.querySelector('.reaction-buttons-container > .like > #liked-number').innerHTML =
			valueRounder(article.reactions.likes.length);
		document.querySelector('.reaction-buttons-container > .share > #shared-number').innerHTML =
			valueRounder(article.reactions.shares);
		document.querySelector(
			'.reaction-buttons-container > .bookmark > #bookmarked-number'
		).innerHTML = valueRounder(article.reactions.bookmarks.length);
		if (userId !== null && article.reactions.likes.includes(Number(userId))) {
			reactions.liked = true;
			document.querySelector('.like').classList.add('liked');
		} else reactions.liked = false;

		if (userId !== null && article.reactions.bookmarks.includes(Number(userId))) {
			reactions.bookmarked = true;
			document.querySelector('.bookmark').classList.add('bookmarked');
		} else reactions.bookmarked = false;

		if (article.comments.length !== 0) {
			article.comments.forEach(
				async (comment, commentId) => {
					await fetch(`/data/users/${comment.userId}`)
						.then((res) => res.json())
						.then(({ success, data }) => {
							if (success) {
								// console.log(comment);
								document.querySelector('#comments').innerHTML =
									`<div class="comment">
								<img src="${data.profilePictureUrl || '/images/user.webp'}" 
									onclick="window.location = \`/user/${data.username}\`" />
								<div class="text">
									<a class="name" href="/user/${data.username}">${data.firstName} ${data.lastName} 
										${Number(userId) === comment.userId ? '(YOU)' : ''}
									</a>
									<span class="data">${comment.comment}</span>
									<span class="stats">
										<span class="commented-date" title="Commented on ${new Date(comment.date).toString()}">
											${timeFromNow(comment.date)}
										</span>
										${
											comment.likedUsers.includes(Number(userId))
												? `<span class="like-comment liked" data-comment-id="${commentId}">liked</span>`
												: `<span class="like-comment" data-comment-id="${commentId}">like</span>`
										}
										<span class="reply-btn">Reply</span>
									</span>
								</div>
							</div>` + document.querySelector('#comments').innerHTML;
								document.querySelector('.no-comments').style.display = 'none';
							}
						})
						.catch((err) => {
							console.log(err);
							document.querySelector('#comments').innerHTML =
								`<div class="comment">
								<img src="/images/user.webp" onclick="window.location = \`/user/unknownOrDeletedUser" />
								<div class="text">
									<span class="name">Deleted User</span>
									<span class="data">${comment.comment}</span>
									<span class="stats">
										<span class="commented-date" title="Commented on ${new Date(comment.date).toString()}">
											${timeFromNow(comment.date)}
										</span>
										${
											comment.likedUsers.includes(Number(userId))
												? `<span class="like-comment liked" data-comment-id="${commentId}">liked</span>`
												: `<span class="like-comment" data-comment-id="${commentId}">like</span>`
										}
										<span class="reply-btn">Reply</span>
									</span>
								</div>
							</div>` + document.querySelector('#comments').innerHTML;
							document.querySelector('.no-comments').style.display = 'none';
						});
					// ? FOR LIKING AND DISLIKING COMMENTS.
					const commentLikeButtons = document.querySelectorAll('.stats > .like-comment');
					commentLikeButtons.forEach((x) => {
						x.addEventListener('click', async (e) => {
							if (userId !== null) {
								if (e.target.classList.contains('liked')) {
									e.target.innerHTML = '...';
									await fetch(
										`${requestingArticleName}?likeComment=false&userId=${sessionStorage.getItem(
											'userId'
										)}&commentId=${e.target.dataset.commentId}`,
										{
											method: 'POST',
											headers: {
												'Content-Type': 'application/json',
											},
										}
									)
										.then((res) => res.json())
										.then((res) => {
											console.log(res);
											if (res.success) {
												e.target.classList.remove('liked');
												e.target.innerHTML = 'like';
											} else {
												e.target.innerHTML = 'liked';
												displayAlertPopup(
													'error',
													`Error occurred when liking comment . ${res.message}`
												);
												console.log(
													'Error occurred when liking comment .',
													res.message
												);
											}
										})
										.catch((err) => {
											console.log(err);
											displayAlertPopup(
												'error',
												`Error occurred when liking comment . ${res.message}`
											);
											console.log(
												'Error occurred when liking comment .',
												res.message
											);
										});
								} else {
									e.target.innerHTML = '...';
									fetch(
										`${requestingArticleName}?likeComment=true&userId=${sessionStorage.getItem(
											'userId'
										)}&commentId=${e.target.dataset.commentId}`,
										{
											method: 'POST',
											headers: {
												'Content-Type': 'application/json',
											},
										}
									)
										.then((res) => res.json())
										.then((res) => {
											console.log(res);
											if (res.success) {
												e.target.classList.add('liked');
												e.target.innerHTML = 'liked';
											} else {
												e.target.innerHTML = 'like';
												console.log(
													'Error occurred when liking comment .',
													res.message
												);
											}
										})
										.catch((err) => console.log(err));
								}
							} else displayAlertPopup('info', 'You are not logged in.');
						});
					});
				},
				{
					headers: {
						'CSRF-Token': token,
					},
				}
			);
		}
	} else console.log(`Error occurred when requesting article data. ${res.message}`);
};
console.log(requestingArticleName);
if (requestingArticleName !== '/data/articles/')
	fetch(requestingArticleName, {
		headers: {
			'CSRF-Token': token,
		},
	})
		.then((res) => res.json())
		.then((res) => renderData(res))
		.catch((err) => console.log(err));
else console.log("You didn't request an article");

// ? //////////////////////////////////////////////////////////////////////////////

const commentContainer = document.querySelector('#comments');
const comment = document.querySelector('#comment-input-container');
const noComments = document.querySelector('.no-comments');

document.querySelector('.comment-send-btn').addEventListener('click', () => {
	sendComment();
	removeNoComments();
});

document.querySelector('.like').addEventListener('click', () => {
	reactionsHandler('like');
});

document.querySelector('.share').addEventListener('click', () => {
	reactionsHandler('share');
});

document.querySelector('.bookmark').addEventListener('click', () => {
	reactionsHandler('bookmark');
});

comment.addEventListener('keyup', function (event) {
	if (event.keyCode === 13) {
		event.preventDefault();
		document.querySelector('.comment-send-btn').click();
	}
});

function sendComment() {
	if (comment.value !== '' && /\S/gi.test(comment.value)) {
		fetch(`${requestingArticleName}?commentOnArticle=true`, {
			method: 'POST',
			body: JSON.stringify({
				userId: Number(sessionStorage.getItem('userId')),
				commentContent: comment.value,
			}),
			headers: {
				'Content-Type': 'application/json',
				'CSRF-Token': token,
			},
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.success) {
					commentContainer.innerHTML =
						`<div class="comment">
							<img src="${sessionStorage.getItem('userProfilePictureUrl') || '/images/user.webp'}" 
								onclick="window.location = \`/user/${sessionStorage.getItem('username')}\`" />
							<div class="text">
								<span class="name">${sessionStorage.getItem('username').replace(/-/gi, ' ')} (you)</span>
								<span class="data">${comment.value}</span>
								<span class="stats">
									<span class="commented-date" title="Commented on ${new Date(comment.date).toString()}">
										${timeFromNow(new Date().getTime())}
									</span>
									<span class="like-comment" data-comment-id="${res.commentId}">like</span>
									<span class="reply-btn">Reply</span>
								</span>
							</div>
						</div>` + commentContainer.innerHTML;
					comment.value = '';
					document.querySelector('.no-comments').style.display = 'none';
				} else displayAlertPopup('info', res.message);
			});
	}
}

const reactionsHandler = async (reaction) => {
	if (reaction === 'like') {
		if (!reactions.liked) {
			await fetch(`${requestingArticleName}?likeArticle=true`, {
				method: 'POST',
				headers: {
					'CSRF-Token': token,
				},
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.success) {
						document
							.querySelector('.reaction-buttons-container > .like')
							.classList.add('liked');
						document.querySelector('#liked-number').innerHTML++;
						reactions.liked = true;
						console.log(res.message);
					} else displayAlertPopup('info', res.message);
				});
		} else {
			await fetch(`${requestingArticleName}?likeArticle=false`, {
				method: 'POST',
				headers: {
					'CSRF-Token': token,
				},
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.success) {
						document
							.querySelector('.reaction-buttons-container > .like')
							.classList.remove('liked');
						document.querySelector('#liked-number').innerHTML--;
						reactions.liked = false;
						console.log(res.message);
					} else displayAlertPopup('info', res.message);
				});
		}
	} else if (reaction === 'share') {
		//! UNSTABLE FEATURE AHEAD
		// const sharePopupData = `<img src="/images/next.webp" alt="Share icon" title="Share this article"/> <h1>Share</h1><p>Share this article with your friends to share the knowledge you gained from this article. This encourages authors to write more as they know they will always have your support for them.</p> <div class="copy-container"><span class="link-container">${document.location.href}</span><span class="copy-btn"><i class="far fa-clipboard"></i></span></div> `;
		// const sharePopup = new Popup(sharePopupData, 'share-popup', false);
		// console.log(sharePopup);
		// sharePopup.toggleRender();
		togglePopup(
			`<img src="/images/next.webp" alt="Share icon" title="Share this article"/> <h1>Share</h1><p>Share this article with your friends to share the knowledge you gained from this article. This encourages authors to write more as they know they will always have your support for them.</p> <div class="copy-container"><span class="link-container">${document.location.href}</span><span class="copy-btn"><i class="far fa-clipboard"></i></span></div> `,
			'share-popup'
		);

		document.querySelector('.copy-btn').addEventListener('click', async () => {
			const href = document.location.href;
			navigator.clipboard.writeText(href).then(
				async () => {
					document.querySelector('.copy-container').classList.add('copied');
					document.querySelector(
						'.share-popup'
					).innerHTML += `<p class="copied-message">Copied to the clipboard.</p>`;
					await fetch(`${requestingArticleName}?shareArticle=true`, {
						headers: {
							'CSRF-Token': token,
						},
					})
						.then((res) => res.json())
						.then((res) => {
							if (res.success) {
								document
									.querySelector('.reaction-buttons-container > .share')
									.classList.add('shared');
								displayAlertPopup(
									'success',
									'Link copied to clipboard successfully.'
								);
								document.querySelector('#shared-number').innerHTML++;
								console.log(res.message);
							}
						});
				},
				() => displayAlertPopup('error', 'Copying link to clipboard failed.')
			);
			// const type = 'text/plain';
			// const blob = new Blob([href], { type });
			// const data = [new ClipboardItem({ [type]: blob })];
			// navigator.clipboard.write(data).then(
		});
	} else if (reaction === 'bookmark') {
		if (!reactions.bookmarked) {
			await fetch(`${requestingArticleName}?bookmarkArticle=true`, {
				method: 'POST',
				headers: {
					'CSRF-Token': token,
				},
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.success) {
						document
							.querySelector('.reaction-buttons-container > .bookmark')
							.classList.add('bookmarked');
						document.querySelector('#bookmarked-number').innerHTML++;
						reactions.bookmarked = true;
						console.log(res.message);
					} else displayAlertPopup('info', res.message);
				});
		} else {
			await fetch(`${requestingArticleName}?bookmarkArticle=false`, {
				method: 'POST',
				headers: {
					'CSRF-Token': token,
				},
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.success) {
						document
							.querySelector('.reaction-buttons-container > .bookmark')
							.classList.remove('bookmarked');
						document.querySelector('#bookmarked-number').innerHTML--;
						reactions.bookmarked = false;
						console.log(res.message);
					} else displayAlertPopup('info', res.message);
				});
		}
	}
};

function removeNoComments() {
	if (document.querySelector('.comment')) {
		document.querySelector('.no-comments').style.display = 'none';
	}
}
