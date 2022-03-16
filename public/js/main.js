const $signUpForm = document.forms.signupform
const $cartWr = document.querySelector('[data-cart]')

if ($signUpForm) {
  console.log('work')
  const $emailInput = $signUpForm.elements.email
  const $nameInput = $signUpForm.elements.name

  const LSKey = 'signUpForm'

  const dataFromLS = JSON.parse(window.localStorage.getItem(LSKey))

  $emailInput.value = dataFromLS?.email
  $nameInput.value = dataFromLS?.name

  $emailInput.addEventListener('input', (e) => {
    console.log(e.target.value)

    const oldData = JSON.parse(window.localStorage.getItem(LSKey))
    console.log({ oldData })

    const objectToSave = {
      ...oldData,
      [e.target.name]: e.target.value,
    }
    window.localStorage.setItem(LSKey, JSON.stringify(objectToSave))
  })

  $nameInput.addEventListener('input', (e) => {
    console.log(e.target.value)

    const oldData = JSON.parse(window.localStorage.getItem(LSKey))
    console.log({ oldData })

    const objectToSave = {
      ...oldData,
      [e.target.name]: e.target.value,
    }
    window.localStorage.setItem(LSKey, JSON.stringify(objectToSave))
  })
}

$cartWr.addEventListener('click', async (e) => {
  if (e.target.dataset.action) {
    const postId = e.target.closest('[data-post]').dataset.post

    const response = await fetch('/post', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId }),
    })

    if (response.status === 200) {
      e.target.closest('[data-post]').remove()
    } else { alert('Удалять может только автор поста') }
  }
})
