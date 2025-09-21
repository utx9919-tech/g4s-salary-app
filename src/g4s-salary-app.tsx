import React, { useState } from 'react';
import { Search, Edit, Trash2, Plus, Calculator, X } from 'lucide-react';

const G4SApp = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSalaryDetail, setShowSalaryDetail] = useState(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const [employees, setEmployees] = useState([
    { id: 1, name: 'สมชาย', surname: 'ใจดี', code: 'G001' },
    { id: 2, name: 'สมหญิง', surname: 'รักงาน', code: 'G002' },
    { id: 3, name: 'วิชัย', surname: 'ขยัน', code: 'G003' }
  ]);

  const [attendance, setAttendance] = useState({});
  const [bonuses, setBonuses] = useState({});
  const [deductions, setDeductions] = useState({});

  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const getDates = () => {
    const dates = [];
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    for (let i = 16; i <= daysInPrevMonth; i++) {
      dates.push({ day: i, month: prevMonth, year: prevYear });
    }
    
    for (let i = 1; i <= 15; i++) {
      dates.push({ day: i, month: currentMonth, year: currentYear });
    }
    
    return dates;
  };

  const dates = getDates();

  const getAttendanceKey = (employeeId, date) => {
    return employeeId + '-' + date.year + '-' + date.month + '-' + date.day;
  };

  const toggleAttendance = (employeeId, date) => {
    if (!isAdminMode) return;
    const key = getAttendanceKey(employeeId, date);
    setAttendance(prev => ({
      ...prev,
      [key]: prev[key] === 'N' ? 'F' : 'N'
    }));
  };

  const getAttendanceStatus = (employeeId, date) => {
    const key = getAttendanceKey(employeeId, date);
    return attendance[key] || 'F';
  };

  const calculateWorkDays = (employeeId) => {
    let workDays = 0;
    let consecutiveDays = 0;
    let sevenDayBonuses = 0;

    dates.forEach(date => {
      const status = getAttendanceStatus(employeeId, date);
      if (status === 'N') {
        workDays++;
        consecutiveDays++;
        if (consecutiveDays === 7) {
          sevenDayBonuses++;
          consecutiveDays = 0;
        }
      } else {
        consecutiveDays = 0;
      }
    });

    return { workDays, sevenDayBonuses };
  };

  const calculateSalary = (employeeId) => {
    const { workDays, sevenDayBonuses } = calculateWorkDays(employeeId);
    const basicSalary = (workDays + sevenDayBonuses) * 600;
    
    const employeeBonuses = bonuses[employeeId] || {};
    const totalBonuses = Object.values(employeeBonuses).reduce((sum, bonus) => {
      return sum + (parseFloat(bonus.amount) || 0);
    }, 0);

    const employeeDeductions = deductions[employeeId] || {};
    const totalDeductions = Object.values(employeeDeductions).reduce((sum, deduction) => {
      return sum + (parseFloat(deduction.amount) || 0);
    }, 0);

    return {
      workDays,
      sevenDayBonuses,
      basicSalary,
      totalBonuses,
      totalDeductions,
      netSalary: basicSalary + totalBonuses - totalDeductions
    };
  };

  const handleLogin = () => {
    if (password === 'admin') {
      setIsAdminMode(true);
      setShowLogin(false);
      setPassword('');
    } else {
      alert('รหัสผ่านไม่ถูกต้อง');
    }
  };

  const updateBonus = (employeeId, type, amount, checked) => {
    setBonuses(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [type]: { checked, amount: checked ? amount : '' }
      }
    }));
  };

  const updateDeduction = (employeeId, type, amount, checked) => {
    setDeductions(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [type]: { checked, amount: checked ? amount : '' }
      }
    }));
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.includes(searchTerm) ||
    emp.surname.includes(searchTerm) ||
    emp.code.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-2">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-bold text-green-400">G4S ผลัด B</h1>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Admin
            </button>
          </div>
          
          <div className="flex gap-2">
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
              className="bg-gray-700 px-3 py-1 rounded text-sm flex-1"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              className="bg-gray-700 px-3 py-1 rounded text-sm flex-1"
            >
              {Array.from({length: 10}, (_, i) => currentYear - 5 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ค้นหา ชื่อ/สกุล/รหัส"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 px-3 py-1 rounded text-sm flex-1"
            />
            <button className="bg-green-600 px-3 py-1 rounded hover:bg-green-700">
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Panel */}
      {isAdminMode && (
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-green-400 font-bold">โหมด Admin</span>
            <button
              onClick={() => setIsAdminMode(false)}
              className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              ออกจาก Admin
            </button>
          </div>
          <button
            onClick={() => setShowAddEmployee(true)}
            className="bg-green-600 px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
          >
            <Plus size={16} /> เพิ่มพนักงาน
          </button>
        </div>
      )}

      {/* Employee List */}
      <div className="space-y-4">
        {filteredEmployees.map(employee => {
          const salaryInfo = calculateSalary(employee.id);
          const employeeBonuses = bonuses[employee.id] || {};
          const employeeDeductions = deductions[employee.id] || {};

          return (
            <div key={employee.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <div className="font-bold text-green-400">
                    {employee.name} {employee.surname}
                  </div>
                  <div className="text-sm text-gray-400">รหัส: {employee.code}</div>
                </div>
                <div className="flex gap-2">
                  {isAdminMode && (
                    <React.Fragment>
                      <button
                        onClick={() => setShowEditEmployee(employee)}
                        className="bg-blue-600 px-2 py-1 rounded hover:bg-blue-700"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(employee.id)}
                        className="bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </React.Fragment>
                  )}
                  <button
                    onClick={() => setShowSalaryDetail(employee.id)}
                    className="bg-purple-600 px-2 py-1 rounded hover:bg-purple-700"
                  >
                    <Calculator size={16} />
                  </button>
                </div>
              </div>

              {/* Attendance Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dates.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => toggleAttendance(employee.id, date)}
                    className={`p-2 rounded text-xs font-bold ${
                      getAttendanceStatus(employee.id, date) === 'N'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    disabled={!isAdminMode}
                  >
                    <div>{date.day}</div>
                    <div>{getAttendanceStatus(employee.id, date)}</div>
                  </button>
                ))}
              </div>

              {/* Admin Controls */}
              {isAdminMode && (
                <div>
                  {/* Bonus Checkboxes */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { key: 'holiday', label: 'วันหยุดนักขัตฤกษ์' },
                      { key: 'allowance', label: 'เบี้ยเลี้ยง' },
                      { key: 'diligence', label: 'เบี้ยขยัน' },
                      { key: 'transport', label: 'ค่าจราจร' }
                    ].map(bonus => (
                      <div key={bonus.key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={employeeBonuses[bonus.key] && employeeBonuses[bonus.key].checked || false}
                          onChange={(e) => {
                            const amount = (employeeBonuses[bonus.key] && employeeBonuses[bonus.key].amount) || '';
                            updateBonus(employee.id, bonus.key, amount, e.target.checked);
                          }}
                        />
                        <span className="text-sm">{bonus.label}</span>
                        <input
                          type="number"
                          placeholder="จำนวน"
                          value={(employeeBonuses[bonus.key] && employeeBonuses[bonus.key].amount) || ''}
                          onChange={(e) => {
                            const checked = (employeeBonuses[bonus.key] && employeeBonuses[bonus.key].checked) || false;
                            updateBonus(employee.id, bonus.key, e.target.value, checked);
                          }}
                          className="bg-gray-700 px-2 py-1 rounded text-xs w-20"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Deduction Checkboxes */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { key: 'social', label: 'ประกันสังคม' },
                      { key: 'life', label: 'ประกันชีวิต' },
                      { key: 'advance', label: 'เบิกล่วงหน้า' },
                      { key: 'equipment', label: 'เบิกอุปกรณ์' }
                    ].map(deduction => (
                      <div key={deduction.key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={(employeeDeductions[deduction.key] && employeeDeductions[deduction.key].checked) || false}
                          onChange={(e) => {
                            const amount = (employeeDeductions[deduction.key] && employeeDeductions[deduction.key].amount) || '';
                            updateDeduction(employee.id, deduction.key, amount, e.target.checked);
                          }}
                        />
                        <span className="text-sm text-red-400">{deduction.label}</span>
                        <input
                          type="number"
                          placeholder="จำนวน"
                          value={(employeeDeductions[deduction.key] && employeeDeductions[deduction.key].amount) || ''}
                          onChange={(e) => {
                            const checked = (employeeDeductions[deduction.key] && employeeDeductions[deduction.key].checked) || false;
                            updateDeduction(employee.id, deduction.key, e.target.value, checked);
                          }}
                          className="bg-gray-700 px-2 py-1 rounded text-xs w-20"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-right text-sm">
                <span className="text-green-400 font-bold">
                  รายได้สุทธิ: {salaryInfo.netSalary.toLocaleString()} บาท
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-80">
            <h3 className="text-lg font-bold mb-4">เข้าสู่โหมด Admin</h3>
            <input
              type="password"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 px-3 py-2 rounded mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleLogin}
                className="bg-green-600 px-4 py-2 rounded flex-1 hover:bg-green-700"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => {setShowLogin(false); setPassword('');}}
                className="bg-gray-600 px-4 py-2 rounded flex-1 hover:bg-gray-700"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <AddEmployeeModal 
          onClose={() => setShowAddEmployee(false)}
          onAdd={(emp) => {
            const id = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
            setEmployees([...employees, { ...emp, id }]);
            setShowAddEmployee(false);
          }}
        />
      )}

      {/* Edit Employee Modal */}
      {showEditEmployee && (
        <EditEmployeeModal 
          employee={showEditEmployee}
          onClose={() => setShowEditEmployee(null)}
          onUpdate={(updatedEmp) => {
            setEmployees(employees.map(emp => 
              emp.id === updatedEmp.id ? updatedEmp : emp
            ));
            setShowEditEmployee(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal 
          employee={employees.find(emp => emp.id === showDeleteConfirm)}
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={() => {
            setEmployees(employees.filter(emp => emp.id !== showDeleteConfirm));
            setShowDeleteConfirm(null);
          }}
        />
      )}

      {/* Salary Detail Modal */}
      {showSalaryDetail && (
        <SalaryDetailModal 
          employee={employees.find(emp => emp.id === showSalaryDetail)}
          salaryInfo={calculateSalary(showSalaryDetail)}
          bonuses={bonuses[showSalaryDetail] || {}}
          deductions={deductions[showSalaryDetail] || {}}
          onClose={() => setShowSalaryDetail(null)}
        />
      )}
    </div>
  );
};

// Add Employee Modal Component
const AddEmployeeModal = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [code, setCode] = useState('');

  const handleAdd = () => {
    if (!name || !surname || !code) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    onAdd({ name, surname, code });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-80">
        <h3 className="text-lg font-bold mb-4">เพิ่มพนักงานใหม่</h3>
        <input
          type="text"
          placeholder="ชื่อ"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-gray-700 px-3 py-2 rounded mb-3"
        />
        <input
          type="text"
          placeholder="นามสกุล"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          className="w-full bg-gray-700 px-3 py-2 rounded mb-3"
        />
        <input
          type="text"
          placeholder="รหัสพนักงาน"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full bg-gray-700 px-3 py-2 rounded mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="bg-green-600 px-4 py-2 rounded flex-1 hover:bg-green-700"
          >
            เพิ่ม
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 px-4 py-2 rounded flex-1 hover:bg-gray-700"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Employee Modal Component
const EditEmployeeModal = ({ employee, onClose, onUpdate }) => {
  const [name, setName] = useState(employee.name);
  const [surname, setSurname] = useState(employee.surname);
  const [code, setCode] = useState(employee.code);

  const handleUpdate = () => {
    if (!name || !surname || !code) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    onUpdate({ ...employee, name, surname, code });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-80">
        <h3 className="text-lg font-bold mb-4">แก้ไขข้อมูลพนักงาน</h3>
        <input
          type="text"
          placeholder="ชื่อ"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-gray-700 px-3 py-2 rounded mb-3"
        />
        <input
          type="text"
          placeholder="นามสกุล"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          className="w-full bg-gray-700 px-3 py-2 rounded mb-3"
        />
        <input
          type="text"
          placeholder="รหัสพนักงาน"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full bg-gray-700 px-3 py-2 rounded mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            className="bg-green-600 px-4 py-2 rounded flex-1 hover:bg-green-700"
          >
            บันทึก
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 px-4 py-2 rounded flex-1 hover:bg-gray-700"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({ employee, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-80">
        <h3 className="text-lg font-bold mb-4 text-red-400">ยืนยันการลบ</h3>
        <p className="mb-4 text-gray-300">
          ต้องการลบพนักงาน "{employee.name} {employee.surname}" หรือไม่?
        </p>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="bg-red-600 px-4 py-2 rounded flex-1 hover:bg-red-700"
          >
            ลบ
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 px-4 py-2 rounded flex-1 hover:bg-gray-700"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};

// Salary Detail Modal Component
const SalaryDetailModal = ({ employee, salaryInfo, bonuses, deductions, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">รายละเอียดรายได้</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="text-center p-3 bg-gray-700 rounded">
            <div className="font-bold text-green-400">
              {employee.name} {employee.surname}
            </div>
            <div className="text-sm text-gray-400">รหัส: {employee.code}</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>วันทำงาน:</span>
              <span>{salaryInfo.workDays} วัน</span>
            </div>
            <div className="flex justify-between">
              <span>โบนัส 7DAY:</span>
              <span>{salaryInfo.sevenDayBonuses} วัน</span>
            </div>
            <div className="flex justify-between">
              <span>เงินเดือนพื้นฐาน:</span>
              <span>{salaryInfo.basicSalary.toLocaleString()} บาท</span>
            </div>
          </div>
          
          <hr className="border-gray-600" />
          
          <div>
            <div className="font-bold text-green-400 mb-2">รายการโบนัส</div>
            {Object.entries(bonuses).map(([key, bonus]) => 
              bonus.checked && bonus.amount ? (
                <div key={key} className="flex justify-between text-sm">
                  <span>{
                    key === 'holiday' ? 'วันหยุดนักขัตฤกษ์' :
                    key === 'allowance' ? 'เบี้ยเลี้ยง' :
                    key === 'diligence' ? 'เบี้ยขยัน' :
                    key === 'transport' ? 'ค่าจราจร' : key
                  }:</span>
                  <span>+{parseFloat(bonus.amount).toLocaleString()} บาท</span>
                </div>
              ) : null
            )}
            <div className="flex justify-between font-bold text-green-400">
              <span>รวมโบนัส:</span>
              <span>+{salaryInfo.totalBonuses.toLocaleString()} บาท</span>
            </div>
          </div>
          
          <hr className="border-gray-600" />
          
          <div>
            <div className="font-bold text-red-400 mb-2">รายการหัก</div>
            {Object.entries(deductions).map(([key, deduction]) => 
              deduction.checked && deduction.amount ? (
                <div key={key} className="flex justify-between text-sm">
                  <span>{
                    key === 'social' ? 'ประกันสังคม' :
                    key === 'life' ? 'ประกันชีวิต' :
                    key === 'advance' ? 'เบิกล่วงหน้า' :
                    key === 'equipment' ? 'เบิกอุปกรณ์' : key
                  }:</span>
                  <span>-{parseFloat(deduction.amount).toLocaleString()} บาท</span>
                </div>
              ) : null
            )}
            <div className="flex justify-between font-bold text-red-400">
              <span>รวมรายจ่าย:</span>
              <span>-{salaryInfo.totalDeductions.toLocaleString()} บาท</span>
            </div>
          </div>
          
          <hr className="border-gray-600" />
          
          <div className="flex justify-between font-bold text-xl text-green-400 p-3 bg-gray-700 rounded">
            <span>รายได้สุทธิ:</span>
            <span>{salaryInfo.netSalary.toLocaleString()} บาท</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default G4SApp;