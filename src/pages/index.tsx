import { useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import copy from "copy-to-clipboard";
import Script from "next/script";
import Head from "next/head";

const Step = ({
  step,
  text,
  children,
}: {
  step: number;
  text: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col mt-12">
      <div className="flex items-center mb-4">
        <div className="flex items-center justify-center text-white bg-black rounded-full font-semibold text-sm h-10 w-10">
          {step}
        </div>
        <p className="text-gray-600 ml-2">{text}</p>
      </div>
      {children}
    </div>
  );
};

const LoadingIndicator = () => {
  return (
    <div className="flex text-center flex-col">
      <picture className="mb-2">
        <img src="./flying-doggo.gif" width={150} alt="A flying dog" />
      </picture>
      <span className="text-black">Generating...</span>
    </div>
  );
};

const Button = (
  props: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
) => {
  return (
    <button
      {...props}
      className="flex items-center justify-center text-white font-semibold duration-300
      bg-black rounded-lg p-2 px-4 outline-none focus:ring focus:ring-black focus:ring-offset-2"
    >
      {props.children}
    </button>
  );
};

const Home = () => {
  const [numberOfTags, setNumberOfTags] = useState(0);
  const [copiedText, setCopiedText] = useState("");
  const [blogTitle, setBlogTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState("#");
  const [error, setError] = useState("");

  const BLOG_CHARACTER_LIMIT = 80;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    const response = await fetch(
      `/api/gpt?title=${blogTitle.trim()}&size=${numberOfTags}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    interface Response {
      success: boolean;
      error?: string;
      tags: string;
    }

    if (response.status === 200) {
      const data: Response = await response.json();

      if (!data.success) {
        setLoading(false);
        return setError(data.error!);
      }

      const separatedTagsArray = data.tags.split(",");

      setTags(separatedTagsArray);

      setLoading(false);
      setNumberOfTags(0);
    }
  };

  const inputRef = useRef(null);

  const seoTitle = "Blog tags generator";
  const seoDescription =
    "No more thinking of thinking of unique tags, now quickly generate tags for your blog posts.";

  return (
    <div className="flex flex-col mx-auto pb-10 max-w-4xl">
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
      </Head>
      <Script async defer src="https://buttons.github.io/buttons.js" />
      <header className="flex flex-col text-center items-center mt-32">
        <h1 className="font-bold tracking-tighter mb-2 text-4xl">{seoTitle}</h1>
        <p className="text-gray-600 max-w-md">{seoDescription}</p>
      </header>
      <Step step={1} text="Enter the title of your blog post.">
        <form onSubmit={submit} className="flex flex-col">
          <input
            className="flex border items-center p-2 rounded-lg outline-none focus:ring focus:ring-black duration-300 px-4"
            placeholder="Why Google stores billions of lines of code in a single repository"
            onChange={(e) => setBlogTitle(e.target.value)}
            ref={inputRef}
            required={true}
            value={blogTitle}
          />
          <div className="w-full justify-between items-center flex mt-2">
            <p
              className={`${
                blogTitle.length > BLOG_CHARACTER_LIMIT
                  ? "text-red-600"
                  : "text-gray-400"
              } text-sm`}
            >
              {blogTitle.length}/{BLOG_CHARACTER_LIMIT}
            </p>
            <div className="ml-auto flex">
              <div className="mr-2">
                <input
                  className="flex border p-2 rounded-lg outline-none focus:ring focus:ring-black duration-300 px-4"
                  onChange={(e) => setNumberOfTags(parseInt(e.target.value))}
                  value={numberOfTags!}
                  max={10}
                  min={0}
                  required={true}
                  placeholder="3"
                  type="number"
                />
              </div>
              <Button>Submit</Button>
            </div>
          </div>
        </form>
      </Step>
      <Step step={2} text="Copy the generated tags.">
        <div className="flex items-center justify-center mt-2">
          {loading ? (
            <div className="mt-10">
              <LoadingIndicator />
            </div>
          ) : (
            <div className="border flex-col w-full shadow-md flex rounded-lg p-4">
              <div className="flex flex-wrap gap-5 my-4">
                <>
                  {tags.length ? (
                    <>
                      {tags.map((tag) => (
                        <div
                          className="border flex font-semibold items-center shadow p-2 rounded-full w-fit px-4 duration-300 hover:shadow-lg cursor-pointer"
                          onClick={() => {
                            const filtered = tags.filter((t) => t !== tag);
                            setTags(filtered);
                          }}
                          key={tag}
                        >
                          <FiX className="text-lg mr-1" />
                          <span>{tag}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <h3 className="text-center font-bold tracking-tight  text-gray-300 text-xl">
                      Start generating!
                    </h3>
                  )}
                </>
              </div>
              <div className=" flex items-center justify-between mt-2">
                <p className="text-green-600 text-sm font-semibold">
                  {copiedText}
                </p>
                <div className="flex items-center">
                  <select
                    className="flex border items-center p-2 rounded-lg outline-none mr-2 px-4 focus:ring focus:ring-black duration-300"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <option>no separator</option>
                    <option>#</option>
                    <option>-</option>
                    <option>,</option>
                  </select>
                  <Button
                    onClick={() => {
                      if (!blogTitle.length) {
                        // @ts-expect-error
                        return inputRef.current?.focus();
                      }
                      let copiedTagsText = "";

                      // Could probably use a switch statement
                      if (format === "#") {
                        let str = "";
                        for (let i = 0; i < tags.length; i++) {
                          str += `#${tags[i]} `;
                        }
                        copiedTagsText = str;
                      } else if (format === "no separator") {
                        copiedTagsText = tags.join(" ");
                      } else if (format === "-") {
                        copiedTagsText = tags.join(" - ");
                      } else {
                        copiedTagsText = tags.join(",");
                      }

                      copy(copiedTagsText);
                      setCopiedText("Copied to clipboard!");

                      setTimeout(() => {
                        setCopiedText("");
                      }, 3000);
                    }}
                  >
                    Copy to clipboard
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Step>
      <footer className="bottom-0 mt-28 text-center">
        <p className="text-gray-600 mb-2">
          Made with ❤️ by <span className="font-bold">Nicholas</span>
        </p>
        <a
          className="github-button"
          href="https://github.com/alsonick"
          target="_blank"
          data-size="large"
          data-show-count="true"
          rel="noreferrer"
          aria-label="Follow @alsonick on GitHub"
        >
          Follow @alsonick
        </a>
      </footer>
    </div>
  );
};

export default Home;
