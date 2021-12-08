import { useLoaderData } from "remix";
import type { LoaderFunction } from "remix";
import { getPost } from "~/post";
import invariant from "tiny-invariant";
import hljs from 'highlight.js';
import {useEffect} from "react";

export const loader: LoaderFunction = async ({
                                               params
                                             }) => {
  invariant(params.slug, "expected params.slug");
  return getPost(params.slug);
};

export default function PostSlug() {
  const post = useLoaderData();
  useEffect(() => {
    hljs.highlightAll();
  })
  return (
    <div dangerouslySetInnerHTML={{ __html: post.html }} />
  );
}