import React, { useEffect, useState } from 'react'
import '../Views/css/Forum.css'
import { useParams } from 'react-router-dom';
import {
    Routes,
    Route,
    Link
} from "react-router-dom";
import axios from 'axios'
const Forum = (props) => {
    const { commId } = useParams();
    const [forum, setForum] = useState([])
    const [posts, setPosts] = useState([])
    useEffect(() => {
        console.log('running effect')
        axios.get('http://localhost:3000/forum/' + commId)
            .then(res => { setForum(res.data) })
        console.log('gotforum')
    }, [])
    useEffect(() => {
        axios.get('http://localhost:3000/posts/' + forum.id)
            .then(res => { console.log('gettingposts'); setPosts(res.data); })
    }, [forum])
    console.log("posts: ", posts)
    const upvote = (id) => {
        console.log(id)
        axios.patch('http://localhost:3000/upvote/', { pid: id, id: props.id })
    }
    const downvote = (id) => {
        axios.patch('http://localhost:3000/downvote/', { pid: id, id: props.id })
    }
    console.log(posts)
    return (
        <div className='root'>
            <h1>{forum.name}</h1>
            <div>
                <Link to={'/MakePost/' + commId + "/" + forum.id}>Post</Link>
                <div className='posts'>

                    {posts.map(i => {
                        return (
                            <div className='post_post_body'>
                                <div className='votes'><p>{i.votes}</p></div>
                                <div>
                                    <Link to={'/post/' + commId + '/' + forum.id + '/' + i.id}>{i.title}</Link>
                                    <div className='post_voting'>
                                        <button onClick={() => upvote(i.id)}>Upvote</button>
                                        <button onClick={() => downvote(i.id)}>Downvote</button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                </div>
            </div>
        </div>
    )
}
export default Forum