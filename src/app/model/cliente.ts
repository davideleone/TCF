

export class Cliente{    
	_id: any;
	nome_cliente: string;
	data_inizio_validita: Date;
	data_fine_validita: Date;
	ambiti: [{
		id_ambito: any,
		nome_ambito: string,
		data_inizio_validita: Date,
		data_fine_validita: Date
	}];
}
