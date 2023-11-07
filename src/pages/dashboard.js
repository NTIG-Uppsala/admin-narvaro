import axios from "axios";
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Background from "../components/Background";
import Logo from "../components/Logo";
import { Container } from "../components/Containers";
import { CopyIcon, RefreshIcon } from "../components/Icons";
import {
  AddUserButton,
  EditButton,
  BackButton,
  SaveButton,
  DeleteButton,
} from "../components/Buttons";

import { getCookie } from "cookies-next";

const InputField = (props) => {
  return (
    <input
      type="text"
      className="bg-transparent text-white border-b-4 border-white mb-5 mt-5"
      disabled={props.disabled || false}
      value={props.value}
      placeholder={props.placeholder}
      onChange={props.onChangeHandler}
    />
  );
};

const Select = ({ options, defaultSelected, onChangeHandler }) => {
  return (
    <select
      className="bg-transparent text-white border-2 p-4 rounded-lg border-white mb-5 mt-5"
      defaultValue={defaultSelected}
      onChange={onChangeHandler}
    >
      {options.map((option, key) => {
        return (
          <option key={key} className="bg-black text-white" value={option._id}>
            {option.display_name}
          </option>
        );
      })}
    </select>
  );
};

const DashboardItem = (props) => {
  const [person, setPerson] = useState(props);
  const [editing, setEditing] = useState(props.editing || false);
  const [textCopied, setTextCopied] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
  const Router = useRouter();
  const [device, setDevice] = useState();
  const [personAuthURL, setAuthURL] = useState("");

  useEffect(() => {
    setAuthURL(document.location.origin + "/setstatus?auth=");
  }, []);

  const toggleEditing = () => {
    setEditing(!editing);
  };

  const copyToClipboard = () => {
    // navigator clipboard api needs a secure context (https)
    let textToCopy = personAuthURL + person.uri;
    if (navigator.clipboard && window.isSecureContext) {
      // navigator clipboard api method'
      setTextCopied(true);
      setTimeout(() => setTextCopied(false), 2000);
      return navigator.clipboard.writeText(textToCopy);
    } else {
      // text area method
      let textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      // make the textarea out of viewport
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      setTextCopied(true);
      setTimeout(() => setTextCopied(false), 2000);

      return new Promise((res, rej) => {
        // here the magic happens
        document.execCommand("copy") ? res() : rej();
        textArea.remove();
      });
    }
  };

  const submit = () => {
    axios
      .post(
        "/api/user/update",
        { user: person },
        { headers: { Authorization: `Bearer ${getCookie("token")}` } }
      )
      .then((response) => {
        if (response.status == 200) {
          console.log("Successfull update -> ", person);
          setEditing(false);
          Router.reload();
        }
      })
      .catch((err) => {
        Router.push("/login");
      });
  };

  const addDevice = () => {
    axios
      .post(
        "/api/device/add",
        { user: person._id, device_name: person._id || "" },
        { headers: { Authorization: `Bearer ${getCookie("token")}` } }
      )
      .then((response) => {
        console.log("Successfull add device -> ", response.data);
        setDevice(response.data);
      })
      .catch((err) => {
        Router.push("/login");
      });
  };

  const regenerateUri = (new_user) => {
    let uri = (len) => {
      let result = "";
      var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var charactersLength = characters.length;
      for (var i = 0; i < len; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    };
    let _NEW = uri(10);

    if (new_user === true) {
      setPerson({ ...person, uri: _NEW });
    } else {
      if (typeof window !== "undefined") {
        let confirm = window.confirm(
          "Är du säker på att du vill generera en ny länk? Den gamla länken kommer inte att fungera längre."
        );
        if (confirm === true) {
          setPerson({ ...person, uri: _NEW });
        }
      }
    }
  };

  return (
    <div className="basis-1/4">
      <Container>
        {editing ? (
          <div className="p-6">
            <p className="text-lg font-bold">Ändrar...</p>
            <div>
              <InputField
                placeholder="Namn.."
                value={person.name}
                onChangeHandler={(e) => {
                  setPerson({ ...person, name: e.target.value });
                }}
              />
            </div>
            <div>
              <InputField
                placeholder="Roll.."
                value={person.role}
                onChangeHandler={(e) => {
                  setPerson({ ...person, role: e.target.value });
                }}
              />
            </div>
            <div>
              <p className="text-2xl uppercase font-bold">Behörighet</p>
              <Select
                options={person.privileges}
                defaultSelected={person.privilege}
                onChangeHandler={(e) => {
                  console.log(e);
                  setPerson({ ...person, privilege: e.target.value });
                }}
              />
            </div>
            <div>
              <p className="text-2xl uppercase font-bold">Grupp</p>
              <Select
                options={person.groups}
                defaultSelected={person.group}
                onChangeHandler={(e) => {
                  setPerson({ ...person, group: e.target.value });
                }}
              />
            </div>
            <div>
              <p className="text-2xl uppercase font-bold">Personlig Länk</p>
              <div className="flex flex-row gap-3 bg-transparent text-white border-b-4 w-auto border-white mb-5">
                {person.uri ? <p>{personAuthURL}</p> : regenerateUri(true)}
                <button onClick={regenerateUri}>
                  <RefreshIcon />
                </button>
                <button onClick={copyToClipboard}>
                  <CopyIcon />
                </button>
                {textCopied && <span>Länk kopierad!</span>}
              </div>
            </div>
            <div>
              <p className="text-2xl uppercase font-bold">Enhet</p>
              <div className="flex flex-row gap-3 bg-transparent items-center text-white w-auto mb-5">
                {!device ? (
                  <p>Klicka för att generera en enhetsnyckel</p>
                ) : (
                  <InputField value={device.token} disabled={true} />
                )}
                <button onClick={addDevice}>
                  <RefreshIcon />
                </button>
                {device?.token ? (
                  <>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(device.token);
                        setTokenCopied(true);
                        setTimeout(() => setTokenCopied(false), 2000);
                      }}
                    >
                      <CopyIcon />
                    </button>
                    {tokenCopied && <span>Nyckel kopierad!</span>}
                  </>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="text-center flex flex-row gap-x-4 justify-center">
              {person._id && <BackButton onClickHandler={toggleEditing} />}
              <SaveButton onClickHandler={submit} />
              <DeleteButton
                onClickHandler={() => {
                  props.deleteHandler(person);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-5">
              <p className="text-3xl mb-2">{props.name}</p>
              <p className="text-2xl">{props.role}</p>
            </div>
            <div className="mb-5">
              <p className="text-2xl uppercase font-bold">Behörighet</p>
              <p className="bg-transparent text-white border-2 p-4 rounded-lg border-white mb-5">
                {props.privilege_name}
              </p>
            </div>
            <div className="mb-5">
              <p className="text-2xl uppercase font-bold">Grupp</p>
              <p className="bg-transparent text-white border-2 p-4 rounded-lg border-white mb-5">
                {props.group_name}
              </p>
            </div>
            <div className="mb-5">
              <p className="text-2xl uppercase font-bold">Personlig Länk</p>
              <div className="flex flex-row gap-3 bg-transparent text-white border-b-4 w-auto border-white mb-5">
                <p>
                  {personAuthURL}
                  {props.uri}
                </p>
                <button onClick={copyToClipboard}>
                  <CopyIcon />
                </button>
                {textCopied && <span>Länk kopierad!</span>}
              </div>
            </div>
            <div className="text-center">
              <EditButton onClickHandler={toggleEditing} />
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

const Dashboard = (props) => {
  const Router = useRouter();
  const [showNewPersonButton, setShowNewPersonButton] = useState(true);
  const [people, setPeople] = useState(
    new Map(
      props.users.map((user) => [
        user._id,
        <DashboardItem
          key={user._id}
          {...user} // object of user values from api
          groups={props.groups}
          privileges={props.privileges}
          group_name={
            props.groups.find((group) => group._id == user.group).display_name
          }
          privilege_name={
            props.privileges.find(
              (privilege) => privilege._id == user.privilege
            ).display_name
          }
          deleteHandler={() => {
            const update_map = new Map(people);
            update_map.delete(user._id);
            if (
              typeof window !== "undefined" &&
              window.confirm(
                "Är du säker på att du vill ta bort " + user.name + "?"
              )
            ) {
              axios
                .post(
                  "/api/user/delete",
                  { user: user },
                  { headers: { Authorization: `Bearer ${getCookie("token")}` } }
                )
                .then((response) => {
                  if (response.status == 200) {
                    console.log("Successfull update -> ", user);
                    setPeople(update_map);
                  }
                })
                .catch((err) => {
                  Router.push("/login");
                });
            }
          }}
        />,
      ])
    )
  );

  const addPerson = () => {
    // https://stackoverflow.com/questions/64517770/how-to-add-value-to-map-initialized-in-state-using-react

    const updated_map = new Map(people);
    updated_map.set(
      updated_map.size.toString(),
      <DashboardItem
        key={updated_map.size}
        name="Ny Användare"
        role="Ny Roll"
        group={props.groups[0]._id}
        privilege={props.privileges[0]._id}
        groups={props.groups}
        privileges={props.privileges}
        group_name={props.groups[0].display_name}
        privilege_name={props.privileges[0].display_name}
        editing={true}
        deleteHandler={() => {
          const update_map = new Map(people);
          update_map.delete(update_map.size.toString());
          setPeople(update_map);
          setShowNewPersonButton(true);
        }}
      />
    );
    setPeople(updated_map);
    setShowNewPersonButton(false);
  };

  return (
    <>
      <Head>
        <title>Administration</title>
      </Head>

      <Background />
      <div className="pt-6 text-center">
        <p className="text-4xl font-bold">Administration</p>
        <p className="text-2xl">Hantera användare</p>
      </div>
      <div className="h-screen flex flex-wrap justify-center basis-1/3 py-5 md:gap-[40px]">
        {!people.length && [...people.keys()].map((item) => people.get(item))}
        {showNewPersonButton && <AddUserButton handler={addPerson} />}
      </div>
    </>
  );
};

export const getServerSideProps = async (context) => {
  try {
    let response = await axios.get(
      `${process.env.HOST_URL}api/auth/authorize`,
      {
        headers: {
          Authorization: `Bearer ${context.req.cookies.token}`,
        },
      }
    );
    if (response.status < 400) {
      let privileges = await axios.get(
        `${process.env.HOST_URL}/api/get/privileges`
      );
      let groups = await axios.get(`${process.env.HOST_URL}/api/get/groups`);
      let users = await axios.get(`${process.env.HOST_URL}/api/get/users`, {
        headers: {
          Authorization: `Bearer ${context.req.cookies.token}`,
        },
      });

      return {
        props: {
          groups: groups.data,
          privileges: privileges.data,
          users: users.data,
        },
      };
    }
  } catch (error) {}
  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
};

export default Dashboard;
