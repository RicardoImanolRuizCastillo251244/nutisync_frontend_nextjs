'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { usePatients } from '@/src/adapters/usePatients';
import type { Patient } from '@/src/core/entities/Patient';
import { useAuth } from '@/src/presentation/contexts/AuthContext';
import { dietPlanRepository } from '@/src/infrastructure/repositories/DietPlanRepositoryImpl';
import AddPatientModal from '@/src/presentation/components/AddPatientModal';
import { DataTable, type DataTableColumn } from '@/src/presentation/components/DataTable';
import Pagination from '@/src/presentation/components/Pagination';
import type { PatientFormValues } from '@/src/utils/validations';

const formatDate = (isoDate: string) =>
	new Date(isoDate).toLocaleDateString('es-MX', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	});

export default function PatientsPage() {
	type PatientsView = 'pending' | 'approved';

	const {
		patients,
		pendingPatients,
		isLoading,
		isPendingLoading,
		error,
		pendingError,
		updatePatient,
		deletePatient,
		approvePatient,
		isUpdating,
		isDeleting,
		isApproving,
	} = usePatients();
	const { user } = useAuth();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
	const [activeView, setActiveView] = useState<PatientsView>('pending');
	const [pendingPage, setPendingPage] = useState(1);
	const [approvedPage, setApprovedPage] = useState(1);
	const [detailsPatient, setDetailsPatient] = useState<Patient | null>(null);
	const [detailsPlanName, setDetailsPlanName] = useState<string>('');
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [isDetailsLoading, setIsDetailsLoading] = useState(false);
	const pageSize = 10;

	const sortedPatients = useMemo(
		() => [...patients].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
		[patients]
	);

	const sortedPendingPatients = useMemo(
		() => [...pendingPatients].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
		[pendingPatients]
	);

	const pendingTotalPages = Math.max(1, Math.ceil(sortedPendingPatients.length / pageSize));
	const approvedTotalPages = Math.max(1, Math.ceil(sortedPatients.length / pageSize));
	const safePendingPage = Math.min(pendingPage, pendingTotalPages);
	const safeApprovedPage = Math.min(approvedPage, approvedTotalPages);

	const paginatedPendingPatients = useMemo(() => {
		const start = (safePendingPage - 1) * pageSize;
		return sortedPendingPatients.slice(start, start + pageSize);
	}, [safePendingPage, sortedPendingPatients]);

	const paginatedApprovedPatients = useMemo(() => {
		const start = (safeApprovedPage - 1) * pageSize;
		return sortedPatients.slice(start, start + pageSize);
	}, [safeApprovedPage, sortedPatients]);

	const closeModal = () => {
		setIsModalOpen(false);
		setEditingPatient(null);
	};

	const closeDetailsModal = () => {
		setIsDetailsOpen(false);
		setDetailsPatient(null);
		setDetailsPlanName('');
	};

	const handleSubmitPatient = async (values: PatientFormValues) => {
		try {
			if (editingPatient) {
				await updatePatient({
					id: editingPatient.id,
					updates: {
						name: values.name,
						lastName: values.lastName,
						email: values.email,
						phone: values.phone,
						birthDate: values.birthDate,
						gender: values.gender,
					},
				});
				toast.success('Paciente actualizado correctamente');
			} else {
				toast.error('Los pacientes se registran desde la app móvil.');
				return;
			}

			closeModal();
		} catch (mutationError) {
			const message =
				mutationError instanceof Error
					? mutationError.message
					: 'Ocurrió un error al guardar el paciente';
			toast.error(message);
		}
	};

	const handleApprove = async (patient: Patient) => {
		try {
			await approvePatient(patient.id);
			toast.success('Paciente dado de alta correctamente');
			setPendingPage(1);
			setApprovedPage(1);
		} catch (mutationError) {
			const message =
				mutationError instanceof Error
					? mutationError.message
					: 'No se pudo dar de alta al paciente';
			toast.error(message);
		}
	};

	const handleDecline = async (patient: Patient) => {
		const confirmed = window.confirm(
			`¿Declinar la solicitud de ${patient.name} ${patient.lastName}?`
		);

		if (!confirmed) return;

		try {
			await deletePatient(patient.id);
			toast.success('Solicitud declinada correctamente');
		} catch (mutationError) {
			const message =
				mutationError instanceof Error
					? mutationError.message
					: 'No se pudo declinar la solicitud';
			toast.error(message);
		}
	};

	const handleViewDetails = async (patient: Patient) => {
		setDetailsPatient(patient);
		setDetailsPlanName('');
		setIsDetailsOpen(true);
		setIsDetailsLoading(true);

		try {
			const activePlan = await dietPlanRepository.getActivePlanByPatient(
				patient.id,
				user?.id ?? ''
			);
			setDetailsPlanName(activePlan?.name ?? 'Sin plan alimenticio asignado');
		} catch {
			setDetailsPlanName('No se pudo cargar el plan alimenticio');
		} finally {
			setIsDetailsLoading(false);
		}
	};

	const handleDelete = async (patient: Patient) => {
		const confirmed = window.confirm(
			`¿Seguro que deseas eliminar a ${patient.name} ${patient.lastName}?`
		);

		if (!confirmed) return;

		try {
			await deletePatient(patient.id);
			toast.success('Paciente eliminado correctamente');
		} catch (mutationError) {
			const message =
				mutationError instanceof Error
					? mutationError.message
					: 'No se pudo eliminar el paciente';
			toast.error(message);
		}
	};

	const columns: DataTableColumn<Patient>[] = [
		{
			key: 'name',
			header: 'Nombre completo',
			render: (patient) => (
				<span className="font-medium text-gray-800">
					{patient.name} {patient.lastName}
				</span>
			),
		},
		{
			key: 'email',
			header: 'Email',
			render: (patient) => <span className="text-gray-600">{patient.email}</span>,
		},
		{
			key: 'phone',
			header: 'Teléfono',
			render: (patient) => <span className="text-gray-600">{patient.phone}</span>,
		},
		{
			key: 'createdAt',
			header: 'Fecha de registro',
			render: (patient) => <span className="text-gray-600">{formatDate(patient.createdAt)}</span>,
		},
		{
			key: 'actions',
			header: 'Acciones',
			className: 'text-right',
			render: (patient) => (
				<div className="flex items-center justify-end gap-2">
					<Link
						href={`/pacientes/${patient.id}`}
						className="btn-brand-outline"
					>
						Historia clínica
					</Link>
					<button
						type="button"
							onClick={() => void handleViewDetails(patient)}
							className="btn-brand"
						disabled={isUpdating || isDeleting}
					>
							Ver detalles
					</button>
					<button
						type="button"
						onClick={() => void handleDelete(patient)}
						className="btn-brand-danger"
						disabled={isUpdating || isDeleting}
					>
						Eliminar
					</button>
				</div>
			),
		},
	];

	const pendingColumns: DataTableColumn<Patient>[] = [
		{
			key: 'name',
			header: 'Paciente',
			render: (patient) => (
				<span className="font-medium text-gray-800">
					{patient.name} {patient.lastName}
				</span>
			),
		},
		{
			key: 'email',
			header: 'Email',
			render: (patient) => <span className="text-gray-600">{patient.email}</span>,
		},
		{
			key: 'createdAt',
			header: 'Solicitud',
			render: (patient) => <span className="text-gray-600">{formatDate(patient.createdAt)}</span>,
		},
		{
			key: 'approve',
			header: 'Acción',
			className: 'text-right',
			render: (patient) => (
				<div className="flex justify-end">
					<button
						type="button"
						onClick={() => void handleApprove(patient)}
						className="btn-brand"
						disabled={isApproving}
					>
						Dar de alta
					</button>
						<button
							type="button"
							onClick={() => void handleDecline(patient)}
							className="ml-2 btn-brand-danger"
							disabled={isApproving || isDeleting}
						>
							Declinar
						</button>
				</div>
			),
		},
	];

	return (
		<section className="space-y-5">
			<div className="mb-6">
				<div>
					<h1 className="text-2xl font-semibold text-gray-800">
						Pacientes
					</h1>
					<p className="text-sm text-gray-500 mt-2">
						Los pacientes se registran desde la app móvil y aquí puedes darles de alta para iniciar su seguimiento.
					</p>
				</div>
			</div>

			<div className="panel-card p-5 space-y-4">
				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						onClick={() => setActiveView('pending')}
						className={`px-4 py-2 rounded-xl font-semibold transition ${
							activeView === 'pending'
								? 'bg-[#24B38A] text-white shadow-md'
								: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
						}`}
					>
						Solicitudes desde app móvil
					</button>
					<button
						type="button"
						onClick={() => setActiveView('approved')}
						className={`px-4 py-2 rounded-xl font-semibold transition ${
							activeView === 'approved'
								? 'bg-[#24B38A] text-white shadow-md'
								: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
						}`}
					>
						Pacientes dados de alta
					</button>
				</div>

				{activeView === 'pending' && (
					<div className="space-y-3">
						<div>
							<h2 className="text-lg font-semibold text-gray-800">Solicitudes desde app móvil</h2>
							<p className="text-sm text-gray-500 mt-1">
								Revisa los pacientes preregistrados y dales de alta para agregarlos a tu cartera.
							</p>
						</div>

						{isPendingLoading && <p className="text-sm text-gray-500">Cargando solicitudes...</p>}
						{!isPendingLoading && pendingError && (
							<div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
								No se pudieron cargar las solicitudes de alta.
							</div>
						)}
						{!isPendingLoading && !pendingError && (
							<>
								<DataTable
									data={paginatedPendingPatients}
									columns={pendingColumns}
									getRowKey={(patient) => patient.id}
									emptyMessage="No hay solicitudes pendientes"
								/>
								<Pagination
									currentPage={safePendingPage}
									totalPages={pendingTotalPages}
									onPageChange={(page) => setPendingPage(Math.max(1, Math.min(page, pendingTotalPages)))}
								/>
							</>
						)}
					</div>
				)}

				{activeView === 'approved' && (
					<div className="space-y-3">
						<div>
							<h2 className="text-lg font-semibold text-gray-800">Pacientes dados de alta</h2>
							<p className="text-sm text-gray-500 mt-1">
								Pacientes activos asignados a tu cuenta.
							</p>
						</div>

						{isLoading && (
							<div className="p-4 text-center text-gray-500">
								Cargando pacientes...
							</div>
						)}

						{!isLoading && error && (
							<div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 shadow-sm">
								No se pudieron cargar los pacientes.
							</div>
						)}

						{!isLoading && !error && (
							<>
								<DataTable
									data={paginatedApprovedPatients}
									columns={columns}
									getRowKey={(patient) => patient.id}
									emptyMessage="No hay pacientes dados de alta"
								/>
								<Pagination
									currentPage={safeApprovedPage}
									totalPages={approvedTotalPages}
									onPageChange={(page) =>
										setApprovedPage(Math.max(1, Math.min(page, approvedTotalPages)))
									}
								/>
							</>
						)}
					</div>
				)}
			</div>

			<AddPatientModal
				isOpen={isModalOpen}
				onClose={closeModal}
				title="Editar paciente"
				submitLabel="Guardar cambios"
				isSubmitting={isUpdating}
				initialValues={
					editingPatient
						? {
								name: editingPatient.name,
								lastName: editingPatient.lastName,
								email: editingPatient.email,
								phone: editingPatient.phone,
								birthDate: editingPatient.birthDate,
								gender: editingPatient.gender,
							}
						: undefined
				}
				onSubmit={handleSubmitPatient}
			/>

			{isDetailsOpen && detailsPatient && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
					<div className="panel-card w-full max-w-lg p-6">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h3 className="text-xl font-semibold text-gray-800">Detalles del paciente</h3>
								<p className="text-sm text-gray-500 mt-1">Resumen del paciente y plan alimenticio asignado.</p>
							</div>
							<button type="button" onClick={closeDetailsModal} className="btn-brand-outline">
								Cerrar
							</button>
						</div>

						<div className="mt-5 space-y-3">
							<div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
								<p className="text-xs uppercase tracking-wide text-gray-500">Nombre</p>
								<p className="mt-1 text-base font-semibold text-gray-800">{detailsPatient.name} {detailsPatient.lastName}</p>
							</div>
							<div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
								<p className="text-xs uppercase tracking-wide text-gray-500">Correo</p>
								<p className="mt-1 text-base font-semibold text-gray-800">{detailsPatient.email}</p>
							</div>
							<div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
								<p className="text-xs uppercase tracking-wide text-gray-500">Teléfono</p>
								<p className="mt-1 text-base font-semibold text-gray-800">{detailsPatient.phone}</p>
							</div>
							<div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
								<p className="text-xs uppercase tracking-wide text-gray-500">Plan alimenticio asignado</p>
								<p className="mt-1 text-base font-semibold text-gray-800">
									{isDetailsLoading ? 'Cargando plan...' : detailsPlanName}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
