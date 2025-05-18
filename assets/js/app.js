const cl = console.log

const form = document.getElementById('postform')
const title = document.getElementById('title')
const content = document.getElementById('content')
const submitbtn = document.getElementById('submitbtn')
const updatebtn = document.getElementById('updatebtn')
const postcontainer = document.getElementById('postcontainer')
const loader = document.getElementById('loader')


const snackbar = (msg, i) => {
    Swal.fire({
        title: msg,
        icon: i,
        timer: 1000
    })
}

const baseurl = `https://fetch-crud-7ef78-default-rtdb.firebaseio.com`
const posturl = `${baseurl}/posts.json`

const apicall = async (url, method, body) => {
    try {
        loader.classList.remove('d-none')
        body = body ? JSON.stringify(body) : null
        let res = await fetch(url, {
            method: method,
            body: body
        })
        return res.json()
    } catch (err) {
        snackbar(err, 'error')
    } finally {
        loader.classList.add('d-none')
    }
}
const createposts = (arr) => {
    let result = arr.map(p => {
        return `<div class="col-md-4 mt-3" id="${p.id}">
            <div class="card h-100">
                <div class="card-header bg-primary">
                    <h3>${p.title}</h3>
                </div>
                <div class="card-body bg-secondary">
                    <p>${p.body}</p>
                </div>
                <div class="card-footer bg-dark d-flex justify-content-between">
                <button class="btn btn-outline-info" onclick="onedit(this)">Edit</button>
                <button class="btn btn-outline-warning" onclick="onremove(this)">Remove</button></div>
            </div>
        </div>`
    }).join('')
    postcontainer.innerHTML = result
}
const fetchposts = async () => {
    try {
        let res = await apicall(posturl, 'GET')
        let arr = []
        for (const key in res) {
            arr.unshift({ ...res[key], id: key })
        }
        createposts(arr)
    } catch {
        snackbar('something went wrong', 'error')
    }
}
fetchposts()
const onedit = async (e) => {
    try {
        let editid = e.closest('.col-md-4').id
        localStorage.setItem('editid', editid)
        let editurl = `${baseurl}/posts/${editid}.json`
        let editobj = await apicall(editurl, 'GET')
        title.value = editobj.title
        content.value = editobj.body
        window.scrollTo({ top: 0, behavior: 'smooth' })
        submitbtn.classList.add('d-none')
        updatebtn.classList.remove('d-none')
    } catch (err) {
        snackbar(err, 'error')
    }
}
const onupdate = async () => {
    try {
        let editid = localStorage.getItem('editid')
        let editurl = `${baseurl}/posts/${editid}.json`
        let updatedobj = {
            title: title.value,
            body: content.value
        }
        form.reset()
        let res = await apicall(editurl, 'PATCH', updatedobj)
        let div = document.getElementById(editid)
        div.querySelector('h3').innerHTML = updatedobj.title
        div.querySelector('p').innerHTML = updatedobj.body
        submitbtn.classList.remove('d-none')
        updatebtn.classList.add('d-none')
        let position = div.offsetTop - 200
        window.scrollTo({ top: position, behavior: 'smooth' })
        snackbar('Post updated successfully', 'success')
    } catch (err) {
        snackbar(err, 'error')
    }
}
const onremove = async (e) => {
    try {
        let result = await Swal.fire({
            title: "Do you want to Remove the Post?",
            showCancelButton: true,
            confirmButtonText: "Remove"
        })
        if (result.isConfirmed) {
            let removeid = e.closest('.col-md-4').id
            let removeurl = `${baseurl}/posts/${removeid}.json`
            let res = await apicall(removeurl, 'DELETE')
            e.closest('.col-md-4').remove()
            snackbar('Post Removed successfully', 'success')
        }

    } catch (err) {
        snackbar(err, 'error')
    }
}
const onsubmit = async (e) => {
    try {
        e.preventDefault()
        let obj = {
            title: title.value,
            body: content.value
        }
        let res = await apicall(posturl, 'POST', obj)
        let div = document.createElement('div')
        div.className = `col-md-4 mt-3`
        div.id = res.name
        div.innerHTML = `<div class="card h-100">
                <div class="card-header bg-primary">
                    <h3>${obj.title}</h3>
                </div>
                <div class="card-body bg-secondary">
                    <p>${obj.body}</p>
                </div>
                <div class="card-footer bg-dark d-flex justify-content-between">
                <button class="btn btn-outline-info" onclick="onedit(this)">Edit</button>
                <button class="btn btn-outline-warning" onclick="onremove(this)">Remove</button></div>
            </div>`
        postcontainer.prepend(div)
        snackbar('Post Added Sucessfully', 'success')
        form.reset()
    } catch (err) {
        snackbar(err, 'error')
    }
}


updatebtn.addEventListener('click', onupdate)
form.addEventListener('submit', onsubmit)