export class User{
	_id:  string
	id_sede:number;
	desc_sede:string;
	password:string;
	cognome:string;
	nome:string;
	email: string;
	data_inizio_validita: Date;
	data_fine_validita:Date;
	clienti: [
		{
			cliente:  any;
			profilo : any;
			data_inizio_validita_cliente : Date;
			data_fine_validita_cliente : Date;
		}
	];
	isAdmin: boolean
}