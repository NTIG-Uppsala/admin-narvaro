import Checkbox from './CheckboxSlider'


const Person = (props) => {
    return (
        <div className={"message-container" + ((props.id % 2 == 0) ? ' gray-color' : '')}>
            <div className="name">
                <span>{props.name}</span>
            </div>
            <div className="container">
                <Checkbox _id={props._id} name={props.name} status={props.status}/>
            </div>
        </div>
    )

}

export default Person