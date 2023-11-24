import { PenIcon, AddUserIcon, TrashIcon, BackIcon} from '../components/Icons'

const Button = (props) => {
    return (
        <button id={props.id} className={"bg-transparent border-[3px] p-3 duration-150 hover:bg-slate-100 hover:text-black border-white text-white rounded-md " + props.className} onClick={props.onClick}>
            <div className='flex flex-row gap-5'>
                {props.children}
            </div>
        </button>
    )

}

export default Button;

export const AddUserButton = ({ handler }) => {
    return (
        <button className='text-white w-72 h-auto hover:border-2 p-4 rounded-lg hover:border-white hover:bg-black/75 duration-150 mb-5 mt-5' onClick={handler}>
            <div className='flex flex-col items-center justify-center gap-5'>
                <p className='text-xl font-bold'>
                    Lägg till användare
                </p>
                <AddUserIcon />
            </div>
        </button>

    )
}


export const EditButton = ({ onClickHandler }) => {
    return (
        <Button id="buttonEdit" className="editButton" onClick={onClickHandler}>
            Redigera
            <PenIcon />
        </Button>
    )
}


export const BackButton = ({ onClickHandler }) => {
    return (
        <Button className="backButton" onClick={onClickHandler}>
            Tillbaka
            <BackIcon />
        </Button>
    )
}

export const SaveButton = ({ onClickHandler }) => {
    return (
        <Button onClick={onClickHandler}>
            Spara
        </Button>
    )
}

export const DeleteButton = ({ onClickHandler }) => {
    return (
        <Button className="deleteButton" onClick={onClickHandler}>
            Ta bort
            <TrashIcon />
        </Button>
    )
}

