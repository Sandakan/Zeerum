// Read the CSRF token from the <meta> tag
const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

const testimonialData = [
	{
		name: 'Roberta Koepp',
		comment:
			'Expedita deleniti fugiat rerum animi illum placeat. Officiis debitis itaque voluptas harum est ratione excepturi. Tenetur reprehenderit reiciendis fuga ratione cupiditate.',
	},
	{
		name: 'Jana Barrows',
		comment:
			'Error accusamus magni ut ab ipsa. Sunt nam quis eius consequatur. Eveniet velit qui quidem ipsum sint. Corporis vitae voluptatem commodi. Earum sint quia velit voluptatum. Ut animi nihil.',
	},
	{
		name: 'Tyrone Swaniawski',
		comment:
			'Et optio enim officia in. Libero illo temporibus quibusdam. Asperiores dolor suscipit molestiae quas saepe. Alias voluptas sed tempora sint natus error. Assumenda cumque ut molestiae.',
	},
	{
		name: 'Maggie Wehner',
		comment:
			'Eos veniam ab reprehenderit consequatur ut inventore. Inventore officia veritatis aut quis. Omnis odio sint ea voluptatibus. Et consequatur animi sit corrupti quae quisquam repellat illo.',
	},
];

const users = document.querySelectorAll('.users-container > img');

users.forEach((user) => {
	user.addEventListener('mouseover', (e) => {
		const data = testimonialData[Number(e.target.getAttribute('data-user-id'))];
		users.forEach((x) => {
			x.classList.remove('active');
		});
		e.target.classList.add('active');
		document.querySelector(
			'.user-comment-container'
		).innerHTML = `${data.comment}<div class="comment-user-name">${data.name}</div>`;
	});
});

let counter = 0;
setInterval(() => {
	counter++;
	if (counter > 3) counter = 0;
	const data = testimonialData[counter];
	users.forEach((user) => user.classList.remove('active'));
	users[counter].classList.add('active');
	document.querySelector(
		'.user-comment-container'
	).innerHTML = `${data.comment}<div class="comment-user-name">${data.name}</div>`;
}, 5000);
