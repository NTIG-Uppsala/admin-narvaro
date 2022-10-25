import GroupOptions from "./DashboardGroupOptions"
import PrivilegeOptions from "./DashboardPrivilegeOptions"
const Person = (props) => {
    return (
        <div className={"message-container message-container-flexwrap" + ((props.id % 2 == 0) ? ' gray-color' : '')} onChange={props.onChange}>
            <div className="name name-size">
                <input type="text" required name="name" id={props._id} defaultValue={props.name}></input>
            </div>
            <div className="name name-size">
                <input type="text" required name="role" id={props._id} defaultValue={props.role}></input>
            </div>
            <div className="container container-flexcenter">
                <PrivilegeOptions name="privilege" id={props._id}  privilege_id={props.privilege_id} />
            </div>
            <div className="container container-flexcenter">
                <GroupOptions  name="group" id={props._id} group_id={props.group_id}/>
            </div>
        </div>
    )
}

export default Person;